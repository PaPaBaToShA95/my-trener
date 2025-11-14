"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import type {
  CreateWorkoutSessionLogInput,
  WorkoutSessionLog,
} from "@/types/training";

interface ExerciseOption {
  id: string;
  name: string;
  defaultSets?: number;
  defaultRepetitions?: number;
}

interface WorkoutSessionLoggerProps {
  workoutId: string;
  workoutTitle: string;
  exerciseOptions: ExerciseOption[];
}

interface SetFormState {
  weightKg: string;
  repetitions: string;
}

type Feedback = { type: "success" | "error"; message: string } | null;

function todayInputValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSessionDate(value: string, formatter: Intl.DateTimeFormat): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatter.format(date);
}

function describeSets(sets: WorkoutSessionLog["sets"]): string {
  return sets
    .slice()
    .sort((a, b) => a.setNumber - b.setNumber)
    .map((set) => {
      const base = `${set.setNumber}: ${set.repetitions} повторень`;
      return set.weightKg !== undefined ? `${base} @ ${set.weightKg} кг` : base;
    })
    .join("; ");
}

function createEmptySet(): SetFormState {
  return { weightKg: "", repetitions: "" };
}

export default function WorkoutSessionLogger({
  workoutId,
  workoutTitle,
  exerciseOptions,
}: WorkoutSessionLoggerProps) {
  const { user, isLoading: isUserLoading, error: userError } = useCurrentUser();
  const [performedAt, setPerformedAt] = useState<string>(() => todayInputValue());
  const [exerciseId, setExerciseId] = useState<string>(() => exerciseOptions[0]?.id ?? "");
  const [sets, setSets] = useState<SetFormState[]>(() => [createEmptySet()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [sessions, setSessions] = useState<WorkoutSessionLog[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const userId = user?.id ?? null;

  const exerciseLookup = useMemo(() => {
    return new Map(exerciseOptions.map((option) => [option.id, option]));
  }, [exerciseOptions]);

  useEffect(() => {
    if (!exerciseOptions.length) {
      setExerciseId("");
      return;
    }

    setExerciseId((current) => {
      if (current && exerciseLookup.has(current)) {
        return current;
      }

      return exerciseOptions[0]?.id ?? "";
    });
  }, [exerciseLookup, exerciseOptions]);

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("uk-UA", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const fetchSessions = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      setHistoryError(null);
      return;
    }

    setIsLoadingSessions(true);
    setHistoryError(null);

    try {
      const params = new URLSearchParams({ userId, workoutId });
      const response = await fetch(`/api/session-logs?${params.toString()}`);
      const payload = (await response.json().catch(() => ({}))) as {
        sessions?: WorkoutSessionLog[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to fetch sessions");
      }

      setSessions(Array.isArray(payload.sessions) ? payload.sessions : []);
    } catch (error) {
      console.error("Failed to fetch workout sessions", error);
      setHistoryError("Не вдалося завантажити історію виконань.");
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId, workoutId]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  function updateSet(index: number, changes: Partial<SetFormState>) {
    setSets((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...changes } : item))
    );
  }

  function addSet() {
    setSets((prev) => [...prev, createEmptySet()]);
  }

  function removeSet(index: number) {
    setSets((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      return prev.filter((_, idx) => idx !== index);
    });
  }

  const selectedExercise = exerciseId ? exerciseLookup.get(exerciseId) ?? null : null;

  const repetitionsPlaceholder = selectedExercise?.defaultRepetitions;

  const canSubmit = Boolean(userId && exerciseId) && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!userId) {
      setFeedback({ type: "error", message: "Увійдіть, щоб зберігати результати." });
      return;
    }

    if (!exerciseId) {
      setFeedback({ type: "error", message: "Оберіть вправу для журналу." });
      return;
    }

    if (!performedAt) {
      setFeedback({ type: "error", message: "Вкажіть дату виконання." });
      return;
    }

    const isoDate = new Date(performedAt);

    if (Number.isNaN(isoDate.getTime())) {
      setFeedback({ type: "error", message: "Невірний формат дати." });
      return;
    }

    const normalizedSets = [] as CreateWorkoutSessionLogInput["sets"];

    for (let index = 0; index < sets.length; index += 1) {
      const current = sets[index];
      const repetitions = Number.parseInt(current.repetitions, 10);

      if (!Number.isFinite(repetitions) || repetitions <= 0) {
        setFeedback({
          type: "error",
          message: `Перевірте кількість повторень у підході ${index + 1}.`,
        });
        return;
      }

      const weightInput = current.weightKg.trim();
      let weightValue: number | undefined;

      if (weightInput) {
        const parsedWeight = Number.parseFloat(weightInput);

        if (!Number.isFinite(parsedWeight) || parsedWeight < 0) {
          setFeedback({
            type: "error",
            message: `Перевірте вагу у підході ${index + 1}.`,
          });
          return;
        }

        weightValue = Number.parseFloat(parsedWeight.toFixed(2));
      }

      normalizedSets.push({
        setNumber: index + 1,
        repetitions: Math.trunc(repetitions),
        weightKg: weightValue,
      });
    }

    if (!normalizedSets.length) {
      setFeedback({ type: "error", message: "Додайте хоча б один підхід." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/session-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutId,
          exerciseId,
          performedAt: isoDate.toISOString(),
          sets: normalizedSets,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не вдалося зберегти сесію.");
      }

      setFeedback({ type: "success", message: "Результат збережено." });
      setSets([createEmptySet()]);
      await fetchSessions();
    } catch (error) {
      console.error("Failed to submit workout session", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Не вдалося зберегти сесію.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Журнал результатів</h2>
        <p className="mt-1 text-sm text-slate-600">
          Занотовуйте виконані підходи для тренування «{workoutTitle}».
        </p>

        {feedback ? (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {userError && !isUserLoading ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {userError}
          </div>
        ) : null}

        {!userId && !isUserLoading ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Щоб зберігати результати, увійдіть до свого облікового запису.
          </div>
        ) : null}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-slate-700">
              <span>Дата виконання</span>
              <input
                type="date"
                value={performedAt}
                onChange={(event) => setPerformedAt(event.target.value)}
                className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-slate-700">
              <span>Вправа</span>
              <select
                value={exerciseId}
                onChange={(event) => {
                  setExerciseId(event.target.value);
                }}
                className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              >
                <option value="" disabled>
                  Оберіть вправу
                </option>
                {exerciseOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {selectedExercise?.defaultRepetitions ? (
                <span className="mt-2 text-xs font-normal text-slate-500">
                  Рекомендація: {selectedExercise.defaultSets ?? ""}
                  {selectedExercise.defaultSets ? " підходів" : null}
                  {selectedExercise.defaultRepetitions ? ` по ${selectedExercise.defaultRepetitions} повторень` : null}
                </span>
              ) : null}
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Підходи</span>
              <button
                type="button"
                onClick={addSet}
                className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                + Додати підхід
              </button>
            </div>

            <div className="space-y-3">
              {sets.map((setState, index) => (
                <div
                  key={index}
                  className="rounded-md border border-slate-200 p-4 shadow-sm sm:flex sm:items-end sm:justify-between"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col text-sm font-medium text-slate-700">
                      <span>Повторення</span>
                      <input
                        type="number"
                        min={1}
                        value={setState.repetitions}
                        onChange={(event) =>
                          updateSet(index, { repetitions: event.target.value })
                        }
                        placeholder={
                          repetitionsPlaceholder
                            ? `${repetitionsPlaceholder}`
                            : undefined
                        }
                        className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        required
                      />
                    </label>

                    <label className="flex flex-col text-sm font-medium text-slate-700">
                      <span>Вага (кг)</span>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={setState.weightKg}
                        onChange={(event) =>
                          updateSet(index, { weightKg: event.target.value })
                        }
                        placeholder="0"
                        className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>
                  </div>

                  {sets.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeSet(index)}
                      className="mt-4 inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 sm:mt-0"
                    >
                      Видалити
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-indigo-300 hover:bg-indigo-700"
            >
              {isSubmitting ? "Збереження…" : "Зберегти результат"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Історія виконань</h3>
        {isLoadingSessions ? (
          <p className="mt-3 text-sm text-slate-600">Завантаження попередніх результатів…</p>
        ) : null}

        {historyError ? (
          <p className="mt-3 text-sm text-rose-700">{historyError}</p>
        ) : null}

        {!userId && !isUserLoading ? (
          <p className="mt-3 text-sm text-slate-600">
            Ввійдіть до системи, щоб переглянути свою історію.
          </p>
        ) : null}

        {userId && !isLoadingSessions && !historyError ? (
          sessions.length > 0 ? (
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {sessions.map((session) => {
                const exercise = exerciseLookup.get(session.exerciseId);
                const exerciseName = exercise?.name ?? session.exerciseId;
                return (
                  <li
                    key={session.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">{exerciseName}</span>
                      <span className="text-xs text-slate-500">
                        {formatSessionDate(session.performedAt, dateTimeFormatter)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{describeSets(session.sets)}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Поки що немає збережених результатів для цього тренування.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
