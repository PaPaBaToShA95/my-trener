"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  exercises as availableExercises,
  workoutTemplates,
  type WorkoutTemplate,
} from "@/data/exercises";
import {
  useUser,
  type UserPlan,
  type UserProfile,
} from "@/lib/user/user-context";

interface PlanExerciseFormState {
  key: string;
  id?: string;
  exerciseId?: string;
  name: string;
  sets: number;
  repetitions?: number;
  weightKg?: number;
}

interface PlanFormState {
  id?: string;
  name: string;
  description: string;
  exercises: PlanExerciseFormState[];
}

type Mode = "loading" | "view" | "choose" | "edit";

type Feedback = { type: "success" | "error"; message: string } | null;

const exerciseLookup = new Map(
  availableExercises.map((exercise) => [exercise.id, exercise])
);

const exerciseOptions = [...availableExercises].sort((a, b) =>
  a.name.localeCompare(b.name, "uk")
);

function generateLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn("Failed to generate UUID via crypto", error);
    }
  }

  return Math.random().toString(36).slice(2, 10);
}

function createEmptyExercise(): PlanExerciseFormState {
  return {
    key: generateLocalId(),
    name: "",
    sets: 3,
    repetitions: undefined,
    weightKg: undefined,
  };
}

function createEmptyPlan(): PlanFormState {
  return {
    id: undefined,
    name: "",
    description: "",
    exercises: [createEmptyExercise()],
  };
}

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function mapPlanToFormState(plan: UserPlan): PlanFormState {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description ?? "",
    exercises: plan.exercises.map((exercise) => ({
      key: exercise.id ?? generateLocalId(),
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      sets: exercise.sets,
      repetitions: exercise.repetitions,
      weightKg: exercise.weightKg,
    })),
  };
}

function mapTemplateToFormState(template: WorkoutTemplate): PlanFormState {
  return {
    id: undefined,
    name: template.title,
    description: template.description,
    exercises: template.exercises.map((exercise) => {
      const details = exerciseLookup.get(exercise.exerciseId);

      return {
        key: generateLocalId(),
        id: undefined,
        exerciseId: exercise.exerciseId,
        name: details?.name ?? exercise.exerciseId,
        sets: exercise.sets,
        repetitions: exercise.repetitions,
        weightKg: exercise.weightKg,
      };
    }),
  };
}

function validatePlanState(plan: PlanFormState): string | null {
  if (!plan.name.trim()) {
    return "Вкажіть назву плану.";
  }

  if (plan.exercises.length === 0) {
    return "Додайте принаймні одну вправу.";
  }

  for (const exercise of plan.exercises) {
    if (!exercise.name.trim()) {
      return "Кожна вправа повинна мати назву.";
    }

    if (!Number.isFinite(exercise.sets) || exercise.sets <= 0) {
      return "Кількість підходів повинна бути більшою за нуль.";
    }

    if (
      exercise.repetitions !== undefined &&
      exercise.repetitions !== null &&
      (!Number.isFinite(exercise.repetitions) || exercise.repetitions <= 0)
    ) {
      return "Кількість повторень повинна бути більшою за нуль.";
    }

    if (
      exercise.weightKg !== undefined &&
      exercise.weightKg !== null &&
      !Number.isFinite(exercise.weightKg)
    ) {
      return "Вага повинна бути числовим значенням.";
    }
  }

  return null;
}

function buildPlanPayload(plan: PlanFormState) {
  return {
    id: plan.id,
    name: plan.name.trim(),
    description: plan.description.trim() ? plan.description.trim() : undefined,
    exercises: plan.exercises.map((exercise) => ({
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      name: exercise.name.trim(),
      sets: Math.max(1, Math.trunc(exercise.sets)),
      repetitions:
        exercise.repetitions !== undefined && exercise.repetitions !== null
          ? Math.max(1, Math.trunc(exercise.repetitions))
          : undefined,
      weightKg:
        exercise.weightKg !== undefined && exercise.weightKg !== null
          ? Number.parseFloat(Number(exercise.weightKg).toFixed(2))
          : undefined,
    })),
  };
}

export default function SelectPlan() {
  const { currentPlan, setCurrentPlan, setProfile } = useUser();
  const [mode, setMode] = useState<Mode>("loading");
  const [customPlan, setCustomPlan] = useState<PlanFormState>(() => createEmptyPlan());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPlan() {
      setIsFetching(true);
      try {
        const response = await fetch("/api/plans", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as {
          profile?: Record<string, unknown> | null;
          plan?: UserPlan | null;
          error?: string;
        };

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            payload?.error ?? `Не вдалося завантажити дані (${response.status}).`
          );
        }

        if (Object.prototype.hasOwnProperty.call(payload, "profile")) {
          setProfile((payload.profile as UserProfile | null) ?? null);
        }

        if (payload.plan) {
          setCurrentPlan(payload.plan);
          setCustomPlan(mapPlanToFormState(payload.plan));
          setMode("view");
        } else {
          setCurrentPlan(null);
          setCustomPlan(createEmptyPlan());
          setMode("choose");
        }
        setFeedback(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(error);
        setProfile(null);
        setCurrentPlan(null);
        setCustomPlan(createEmptyPlan());
        setFeedback({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Не вдалося завантажити інформацію про план.",
        });
        setMode("choose");
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    void loadPlan();

    return () => {
      isMounted = false;
    };
  }, [setCurrentPlan, setProfile]);

  useEffect(() => {
    if (mode === "loading" && !isFetching) {
      setMode(currentPlan ? "view" : "choose");
    }
  }, [currentPlan, isFetching, mode]);

  const handleAddExercise = () => {
    setCustomPlan((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createEmptyExercise()],
    }));
  };

  const handleRemoveExercise = (key: string) => {
    setCustomPlan((prev) => ({
      ...prev,
      exercises:
        prev.exercises.length <= 1
          ? prev.exercises
          : prev.exercises.filter((exercise) => exercise.key !== key),
    }));
  };

  const handleSelectTemplate = async (template: WorkoutTemplate) => {
    const plan = mapTemplateToFormState(template);
    const errorMessage = validatePlanState(plan);

    if (errorMessage) {
      setFeedback({ type: "error", message: errorMessage });
      return;
    }

    await savePlan(plan);
  };

  const savePlan = async (planState: PlanFormState) => {
    const validationError = validatePlanState(planState);

    if (validationError) {
      setFeedback({ type: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: buildPlanPayload(planState) }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        profile?: Record<string, unknown> | null;
        plan?: UserPlan | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload?.error ?? `Не вдалося зберегти план (${response.status}).`
        );
      }

      if (Object.prototype.hasOwnProperty.call(payload, "profile")) {
        setProfile((payload.profile as UserProfile | null) ?? null);
      }

      if (payload.plan) {
        setCurrentPlan(payload.plan);
        setCustomPlan(mapPlanToFormState(payload.plan));
        setMode("view");
      }

      setFeedback({ type: "success", message: "План успішно збережено." });
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося зберегти план. Спробуйте ще раз.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomPlanSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await savePlan(customPlan);
  };

  const isLoading = mode === "loading" || isFetching;

  const activePlan = currentPlan;

  const renderExerciseRow = (exercise: PlanExerciseFormState, index: number) => {
    const selectedExercise = exercise.exerciseId
      ? exerciseLookup.get(exercise.exerciseId)
      : undefined;

    return (
      <div
        key={exercise.key}
        className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Вправа {index + 1}
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={exercise.exerciseId ?? ""}
              onChange={(event) => {
                const nextId = event.target.value || undefined;
                const nextDetails = nextId ? exerciseLookup.get(nextId) : undefined;
                setCustomPlan((prev) => ({
                  ...prev,
                  exercises: prev.exercises.map((item) =>
                    item.key === exercise.key
                      ? {
                          ...item,
                          exerciseId: nextId,
                          name: nextDetails?.name ?? item.name,
                          sets:
                            nextDetails?.defaultSets !== undefined
                              ? nextDetails.defaultSets
                              : item.sets,
                          repetitions:
                            nextDetails?.defaultRepetitions ?? item.repetitions,
                        }
                      : item
                  ),
                }));
              }}
              disabled={isSubmitting}
            >
              <option value="">— Оберіть вправу —</option>
              {exerciseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {selectedExercise?.description ? (
              <p className="mt-2 text-xs text-slate-500">
                {selectedExercise.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 md:mt-0 md:w-auto"
            onClick={() => handleRemoveExercise(exercise.key)}
            disabled={isSubmitting || customPlan.exercises.length <= 1}
          >
            Видалити
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Назва
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={exercise.name}
              onChange={(event) => {
                const nextName = event.target.value;
                setCustomPlan((prev) => ({
                  ...prev,
                  exercises: prev.exercises.map((item) =>
                    item.key === exercise.key ? { ...item, name: nextName } : item
                  ),
                }));
              }}
              placeholder="Наприклад, Жим лежачи"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Підходи
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={exercise.sets}
              onChange={(event) => {
                const rawValue = Number(event.target.value);
                setCustomPlan((prev) => ({
                  ...prev,
                  exercises: prev.exercises.map((item) =>
                    item.key === exercise.key
                      ? {
                          ...item,
                          sets: Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 1,
                        }
                      : item
                  ),
                }));
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Повторення
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={exercise.repetitions ?? ""}
              onChange={(event) => {
                const rawValue = event.target.value;
                setCustomPlan((prev) => ({
                  ...prev,
                  exercises: prev.exercises.map((item) =>
                    item.key === exercise.key
                      ? {
                          ...item,
                          repetitions:
                            rawValue === ""
                              ? undefined
                              : Number.isFinite(Number(rawValue))
                                ? Number(rawValue)
                                : item.repetitions,
                        }
                      : item
                  ),
                }));
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Вага (кг)
            </label>
            <input
              type="number"
              min={0}
              step="0.5"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={exercise.weightKg ?? ""}
              onChange={(event) => {
                const rawValue = event.target.value;
                setCustomPlan((prev) => ({
                  ...prev,
                  exercises: prev.exercises.map((item) =>
                    item.key === exercise.key
                      ? {
                          ...item,
                          weightKg:
                            rawValue === ""
                              ? undefined
                              : Number.isFinite(Number(rawValue))
                                ? Number(rawValue)
                                : item.weightKg,
                        }
                      : item
                  ),
                }));
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <article className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">План тренувань</h2>
        <p className="text-sm text-slate-600">
          Оберіть готову програму або сформуйте власний план, щоб слідкувати за
          прогресом.
        </p>
      </header>

      {feedback ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-600"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : mode === "view" && activePlan ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {activePlan.name}
                </h3>
                {activePlan.description ? (
                  <p className="text-sm text-slate-600">
                    {activePlan.description}
                  </p>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">
                Оновлено {formatTimestamp(activePlan.updatedAt)}
              </p>
            </div>
            <p className="text-sm text-slate-600">
              У плані {activePlan.exercises.length} вправа(-и).
            </p>
          </div>
          <ul className="space-y-3">
            {activePlan.exercises.map((exercise, index) => (
              <li
                key={exercise.id ?? `${exercise.name}-${index}`}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {index + 1}. {exercise.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {exercise.sets} підходів
                      {exercise.repetitions
                        ? ` · ${exercise.repetitions} повторень`
                        : ""}
                      {exercise.weightKg !== undefined
                        ? ` · ${exercise.weightKg} кг`
                        : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              onClick={() => {
                setCustomPlan(mapPlanToFormState(activePlan));
                setMode("edit");
                setFeedback(null);
              }}
              disabled={isSubmitting}
            >
              Редагувати план
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              onClick={() => {
                setCustomPlan(createEmptyPlan());
                setMode("choose");
                setFeedback(null);
              }}
              disabled={isSubmitting}
            >
              Обрати іншу програму
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {mode === "edit" ? "Редагування плану" : "Налаштування плану"}
            </h3>
            {mode === "edit" ? (
              <button
                type="button"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                onClick={() => {
                  if (activePlan) {
                    setCustomPlan(mapPlanToFormState(activePlan));
                    setMode("view");
                  }
                }}
                disabled={isSubmitting}
              >
                Скасувати редагування
              </button>
            ) : null}
          </div>
          {mode !== "edit" ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Готові програми
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {workoutTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {template.title}
                        </p>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-600">
                          {template.level === "beginner"
                            ? "Початковий"
                            : template.level === "intermediate"
                            ? "Середній"
                            : "Просунутий"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{template.focus}</p>
                      <p className="text-sm text-slate-600">{template.description}</p>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
                        {template.exercises.slice(0, 4).map((exercise) => {
                          const exerciseInfo = exerciseLookup.get(exercise.exerciseId);
                          return (
                            <li key={exercise.exerciseId}>
                              {exerciseInfo?.name ?? exercise.exerciseId}
                            </li>
                          );
                        })}
                        {template.exercises.length > 4 ? (
                          <li>та інші {template.exercises.length - 4} вправи…</li>
                        ) : null}
                      </ul>
                      <p className="text-xs text-slate-500">
                        Тривалість: приблизно {template.durationMinutes} хв
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                      onClick={() => {
                        void handleSelectTemplate(template);
                      }}
                      disabled={isSubmitting}
                    >
                      Активувати план
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {mode === "edit" ? "Редагувати власний план" : "Створити власний план"}
            </h4>
            <form className="space-y-4" onSubmit={handleCustomPlanSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">
                    Назва плану
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={customPlan.name}
                    onChange={(event) =>
                      setCustomPlan((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Наприклад, Силовий спліт"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">
                    Опис (необов’язково)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={customPlan.description}
                    onChange={(event) =>
                      setCustomPlan((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Додайте короткий опис"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {customPlan.exercises.map((exercise, index) => renderExerciseRow(exercise, index))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  onClick={handleAddExercise}
                  disabled={isSubmitting}
                >
                  Додати вправу
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Збереження…" : "Зберегти план"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
