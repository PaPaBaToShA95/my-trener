"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  exercises as availableExercises,
  workoutTemplates,
  type WorkoutTemplate,
} from "@/data/exercises";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useUser,
  type UserPlan,
  type UserProfile,
} from "@/lib/user/user-context";
import { cn } from "@/lib/utils";

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
      return "Вага повинна бути числовим значення.";
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

function calculatePlanCompletion(plan: PlanFormState): number {
  if (!plan.name.trim()) {
    return 10;
  }

  if (plan.exercises.length === 0) {
    return 10;
  }

  const completedExercises = plan.exercises.filter((exercise) =>
    Boolean(exercise.name.trim() && exercise.sets > 0)
  ).length;

  const base = Math.round((completedExercises / plan.exercises.length) * 100);
  return Number.isFinite(base) ? Math.min(100, Math.max(10, base)) : 10;
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

  const planCompletion = useMemo(
    () => calculatePlanCompletion(customPlan),
    [customPlan]
  );

  const renderExerciseRow = (exercise: PlanExerciseFormState, index: number) => {
    const selectedExercise = exercise.exerciseId
      ? exerciseLookup.get(exercise.exerciseId)
      : undefined;

    const selectId = `exercise-select-${exercise.key}`;
    const nameId = `exercise-name-${exercise.key}`;
    const setsId = `exercise-sets-${exercise.key}`;
    const repsId = `exercise-reps-${exercise.key}`;
    const weightId = `exercise-weight-${exercise.key}`;

    return (
      <div
        key={exercise.key}
        className="space-y-4 rounded-xl border border-border/70 bg-muted/30 p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Вправа {index + 1}
            </p>
            <p className="text-sm text-foreground">
              {exercise.name ? exercise.name : "Не вибрано"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveExercise(exercise.key)}
                  disabled={isSubmitting || customPlan.exercises.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Видалити вправу</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Видалити вправу з плану</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={selectId}>Вправа зі списку</Label>
            <select
              id={selectId}
              className={cn(
                "focus-ring h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
                "text-foreground shadow-sm"
              )}
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
                          repetitions: nextDetails?.defaultRepetitions ?? item.repetitions,
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
              <p className="text-xs text-muted-foreground">
                {selectedExercise.description}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor={nameId}>Назва в плані</Label>
            <Input
              id={nameId}
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
          <div className="space-y-2">
            <Label htmlFor={setsId}>Підходи</Label>
            <Input
              id={setsId}
              type="number"
              min={1}
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
          <div className="space-y-2">
            <Label htmlFor={repsId}>Повторення</Label>
            <Input
              id={repsId}
              type="number"
              min={1}
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
          <div className="space-y-2">
            <Label htmlFor={weightId}>Вага (кг)</Label>
            <Input
              id={weightId}
              type="number"
              min={0}
              step="0.5"
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

  const renderTemplates = () => {
    if (mode !== "choose") {
      return null;
    }

    return (
      <div className="space-y-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Готові шаблони
            </h4>
            <p className="text-sm text-muted-foreground">
              Оберіть план як основу та налаштуйте його під власні цілі.
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {workoutTemplates.map((template) => {
            const totalExercises = template.exercises.length;
            return (
              <Card
                key={template.id}
                className="border border-primary/20 bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {template.title}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <Badge variant="muted" className="w-fit">
                    {template.level === "beginner"
                      ? "Початковий рівень"
                      : template.level === "intermediate"
                      ? "Середній рівень"
                      : "Просунутий рівень"}
                  </Badge>
                  <ul className="list-disc space-y-1 pl-4">
                    {template.exercises.slice(0, 4).map((exercise) => {
                      const exerciseInfo = exerciseLookup.get(exercise.exerciseId);
                      return (
                        <li key={exercise.exerciseId}>
                          {exerciseInfo?.name ?? exercise.exerciseId}
                        </li>
                      );
                    })}
                    {totalExercises > 4 ? (
                      <li>та ще {totalExercises - 4} вправ</li>
                    ) : null}
                  </ul>
                  <p>Тривалість: ≈ {template.durationMinutes} хв</p>
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      void handleSelectTemplate(template);
                    }}
                    disabled={isSubmitting}
                  >
                    Активувати план
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold">
            {mode === "edit" ? "Редагувати план" : "Поточний план тренувань"}
          </CardTitle>
          <CardDescription className="max-w-2xl">
            Створіть або налаштуйте персональний план. Система показує прогрес заповнення та підказує, які кроки залишились.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant={mode === "edit" ? "secondary" : "muted"}>
              {mode === "view"
                ? "Режим перегляду"
                : mode === "edit"
                ? "Режим редагування"
                : "Створення плану"}
            </Badge>
            {activePlan?.updatedAt ? (
              <Badge variant="outline">
                Оновлено {formatTimestamp(activePlan.updatedAt)}
              </Badge>
            ) : null}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Готовність</span>
              <Progress value={planCompletion} className="h-1.5 w-32" />
              <span className="font-semibold text-foreground">{planCompletion}%</span>
            </div>
          </div>
        </div>
        {activePlan ? (
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Переглянути план
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{activePlan.name}</DialogTitle>
                  <DialogDescription>
                    {activePlan.description ?? "Поточна версія збереженого плану."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2 text-muted-foreground">
                    <Badge variant="muted">Вправ: {activePlan.exercises.length}</Badge>
                    {activePlan.updatedAt ? (
                      <Badge variant="outline">
                        Оновлено {formatTimestamp(activePlan.updatedAt)}
                      </Badge>
                    ) : null}
                  </div>
                  <ul className="space-y-2">
                    {activePlan.exercises.map((exercise) => (
                      <li
                        key={exercise.id ?? exercise.exerciseId}
                        className="rounded-md border border-border/60 bg-muted/40 px-3 py-2"
                      >
                        <p className="font-medium text-foreground">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets} підходів
                          {exercise.repetitions ? ` · ${exercise.repetitions} повторень` : ""}
                          {exercise.weightKg ? ` · ${exercise.weightKg} кг` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    setMode("edit");
                    setCustomPlan(mapPlanToFormState(activePlan));
                  }}
                >
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                  Редагувати
                </Button>
              </TooltipTrigger>
              <TooltipContent>Відредагувати та зберегти нову версію плану</TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Завантаження плану…</p>
              <p>Зачекайте декілька секунд. Ми готуємо ваші дані.</p>
            </div>
            <Progress value={45} className="h-1.5 w-48" aria-label="Стан завантаження" />
          </div>
        ) : (
          <div className="space-y-6">
            {feedback ? (
              <div
                role="status"
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                  feedback.type === "success"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                )}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                )}
                <p>{feedback.message}</p>
              </div>
            ) : null}

            {renderTemplates()}

            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-foreground">
                    {mode === "edit" ? "Редагувати власний план" : "Створити власний план"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Заповніть інформацію, щоб персоналізувати тренування.
                  </p>
                </div>
                <Badge variant="outline" className="w-fit">
                  Вправ у плані: {customPlan.exercises.length}
                </Badge>
              </div>
              <form className="space-y-5" onSubmit={handleCustomPlanSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="plan-name">Назва плану</Label>
                    <Input
                      id="plan-name"
                      value={customPlan.name}
                      onChange={(event) =>
                        setCustomPlan((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Наприклад, Силовий спліт"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-description">Короткий опис</Label>
                    <Textarea
                      id="plan-description"
                      value={customPlan.description}
                      onChange={(event) =>
                        setCustomPlan((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Додайте деталі, що мотивують."
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {customPlan.exercises.map((exercise, index) =>
                    renderExerciseRow(exercise, index)
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={handleAddExercise}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Додати вправу
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" className="gap-2" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        )}
                        {isSubmitting ? "Збереження…" : "Зберегти план"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      План буде збережено та застосовано до профілю
                    </TooltipContent>
                  </Tooltip>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 border-t border-border/60 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <p>
          Пам’ятайте: ви можете оновлювати план будь-якої миті. Система збереже попередні версії для історії.
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Автозбереження активне
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-3 py-1 text-info">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Поради адаптуються до ваших дій
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
