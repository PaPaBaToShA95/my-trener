"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Minus,
  PlayCircle,
  Plus,
  Timer,
  Trophy,
  Weight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/user/user-context";
import {
  createTrainingSessionRecord,
  getLatestTrainingSessionRecord,
} from "@/lib/repos/training-sessions";
import type {
  CreateTrainingSessionRecord,
  TrainingSessionRecord,
} from "@/types/mobile-app";

interface TrainingSessionRunnerProps {
  sessionId: string;
  muscleGroup: string;
  sessionName: string;
  exercises: string[];
}

type StepDefinition = {
  id: string;
  type: "treadmill" | "exercise";
  label: string;
  subtitle?: string;
};

type TreadmillStepValues = {
  type: "treadmill";
  speedKmH: number | null;
  durationMinutes: number | null;
  actualDurationSeconds: number | null;
  startedAt: string | null;
  completedAt: string | null;
};

type ExerciseStepValues = {
  type: "exercise";
  weightKg: number | null;
  sets: number | null;
  repetitions: number | null;
  actualDurationSeconds: number | null;
  startedAt: string | null;
  completedAt: string | null;
};

type StepValues = TreadmillStepValues | ExerciseStepValues;

type CompletionSummary = {
  totalDurationSeconds: number;
  maxWeightKg: number | null;
  longestExerciseSeconds: number | null;
};

function createSteps(exercises: string[]): StepDefinition[] {
  const warmup: StepDefinition = {
    id: "warmup",
    type: "treadmill",
    label: "Бігова доріжка",
    subtitle: "Розминка",
  };

  const cooldown: StepDefinition = {
    id: "cooldown",
    type: "treadmill",
    label: "Бігова доріжка",
    subtitle: "Заминка",
  };

  const exerciseSteps: StepDefinition[] = exercises.map((exercise, index) => ({
    id: `exercise-${index}`,
    type: "exercise",
    label: exercise,
  }));

  return [warmup, ...exerciseSteps, cooldown];
}

function createEmptyValues(steps: StepDefinition[]): Record<string, StepValues> {
  const initial: Record<string, StepValues> = {};

  for (const step of steps) {
    if (step.type === "treadmill") {
      initial[step.id] = {
        type: "treadmill",
        speedKmH: null,
        durationMinutes: 10,
        actualDurationSeconds: null,
        startedAt: null,
        completedAt: null,
      } satisfies TreadmillStepValues;
    } else {
      initial[step.id] = {
        type: "exercise",
        weightKg: null,
        sets: 4,
        repetitions: 12,
        actualDurationSeconds: null,
        startedAt: null,
        completedAt: null,
      } satisfies ExerciseStepValues;
    }
  }

  return initial;
}

function formatClock(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remaining = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) {
    return "—";
  }

  const totalMinutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (totalMinutes === 0) {
    return `${remainingSeconds} с`;
  }

  if (remainingSeconds === 0) {
    return `${totalMinutes} хв`;
  }

  return `${totalMinutes} хв ${remainingSeconds} с`;
}

function parseNumber(input: string): number | null {
  if (!input.trim()) {
    return null;
  }

  const normalized = Number(input.replace(",", "."));

  return Number.isFinite(normalized) ? normalized : null;
}

export function TrainingSessionRunner({
  sessionId,
  muscleGroup,
  sessionName,
  exercises,
}: TrainingSessionRunnerProps) {
  const { profile } = useUser();
  const steps = useMemo(() => createSteps(exercises), [exercises]);
  const [stepValues, setStepValues] = useState<Record<string, StepValues>>(() =>
    createEmptyValues(steps),
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isCountdown, setIsCountdown] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [sessionCompletedAt, setSessionCompletedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const countdownStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  const sessionFinished = Boolean(sessionCompletedAt);
  const activeStep = steps[currentStepIndex];

  const resetValuesFromHistory = useCallback(
    (record: TrainingSessionRecord) => {
      const base = createEmptyValues(steps);

      for (const step of steps) {
        const history = record.steps.find((entry) => entry.id === step.id);
        if (!history) {
          continue;
        }

        if (step.type === "treadmill") {
          base[step.id] = {
            ...(base[step.id] as TreadmillStepValues),
            speedKmH: history.speedKmH ?? (base[step.id] as TreadmillStepValues).speedKmH,
            durationMinutes: history.durationSeconds
              ? Math.round(history.durationSeconds / 60)
              : (base[step.id] as TreadmillStepValues).durationMinutes,
          };
        } else {
          base[step.id] = {
            ...(base[step.id] as ExerciseStepValues),
            weightKg: history.weightKg ?? (base[step.id] as ExerciseStepValues).weightKg,
            sets: history.sets ?? (base[step.id] as ExerciseStepValues).sets,
            repetitions: history.repetitions ?? (base[step.id] as ExerciseStepValues).repetitions,
          };
        }
      }

      setStepValues(base);
    },
    [steps],
  );

  useEffect(() => {
    if (!profile?.id) {
      setLoadingHistory(false);
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const latest = await getLatestTrainingSessionRecord(profile.id, sessionId);
        if (!isMounted) {
          return;
        }

        if (latest) {
          resetValuesFromHistory(latest);
        } else {
          setStepValues(createEmptyValues(steps));
        }
      } catch (error) {
        console.error("Failed to load training history", error);
        if (isMounted) {
          setHistoryError("Не вдалося завантажити попередні результати. Дані не збережені.");
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [profile?.id, resetValuesFromHistory, sessionId, steps]);

  useEffect(() => {
    if (!isTimerRunning) {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setTimerSeconds((prev) => (isCountdown ? Math.max(prev - 1, 0) : prev + 1));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isCountdown, isTimerRunning]);
  const completeStep = useCallback(
    (stepId: string, durationSeconds: number) => {
      const step = steps.find((definition) => definition.id === stepId);
      if (!step) {
        return;
      }

      setActiveStepId(null);
      setIsTimerRunning(false);
      setTimerSeconds(0);
      setIsCountdown(false);

      const safeDuration = Math.max(0, Math.round(durationSeconds));
      const completedAt = new Date().toISOString();

      setStepValues((prev) => {
        const current = prev[stepId];
        if (!current) {
          return prev;
        }

        return {
          ...prev,
          [stepId]: {
            ...current,
            actualDurationSeconds: safeDuration,
            completedAt,
          } as StepValues,
        };
      });

      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    },
    [steps],
  );

  useEffect(() => {
    if (!isTimerRunning || !isCountdown || timerSeconds > 0 || !activeStepId) {
      return;
    }

    setIsTimerRunning(false);
    const duration = countdownStartRef.current;
    countdownStartRef.current = 0;
    void completeStep(activeStepId, duration);
  }, [activeStepId, isCountdown, isTimerRunning, timerSeconds, completeStep]);

  const updateStepValues = useCallback(
    (stepId: string, updates: Partial<TreadmillStepValues> | Partial<ExerciseStepValues>) => {
      setStepValues((prev) => {
        const current = prev[stepId];
        if (!current) {
          return prev;
        }

        return {
          ...prev,
          [stepId]: {
            ...current,
            ...updates,
          } as StepValues,
        };
      });
    },
    [],
  );

  const adjustWeight = useCallback(
    (stepId: string, delta: number) => {
      setStepValues((prev) => {
        const current = prev[stepId];
        if (!current || current.type !== "exercise") {
          return prev;
        }

        const nextWeight = Math.max(0, (current.weightKg ?? 0) + delta);

        return {
          ...prev,
          [stepId]: {
            ...current,
            weightKg: Number.isFinite(nextWeight) ? Math.round(nextWeight * 10) / 10 : 0,
          },
        };
      });
    },
    [],
  );

  const startCurrentStep = useCallback(() => {
    const step = steps[currentStepIndex];

    if (!step || isTimerRunning || sessionFinished) {
      return;
    }

    const values = stepValues[step.id];

    if (!sessionStartedAt) {
      setSessionStartedAt(new Date().toISOString());
    }

    if (step.type === "treadmill") {
      const speed = values?.type === "treadmill" ? values.speedKmH ?? 0 : 0;
      const durationMinutes = values?.type === "treadmill" ? values.durationMinutes ?? 0 : 0;

      if (!speed || !durationMinutes) {
        setGlobalError("Для доріжки вкажіть швидкість та тривалість.");
        return;
      }

      const durationSeconds = Math.max(5, Math.round(durationMinutes * 60));
      countdownStartRef.current = durationSeconds;
      setTimerSeconds(durationSeconds);
      setIsCountdown(true);
      setIsTimerRunning(true);
      setGlobalError(null);
      setActiveStepId(step.id);
      updateStepValues(step.id, {
        startedAt: new Date().toISOString(),
        completedAt: null,
        actualDurationSeconds: null,
      });
    } else {
      const sets = values?.type === "exercise" ? values.sets ?? 0 : 0;
      const repetitions = values?.type === "exercise" ? values.repetitions ?? 0 : 0;

      if (!sets || !repetitions) {
        setGlobalError("Для вправи вкажіть підходи та повторення.");
        return;
      }

      setTimerSeconds(0);
      setIsCountdown(false);
      setIsTimerRunning(true);
      setGlobalError(null);
      setActiveStepId(step.id);
      updateStepValues(step.id, {
        startedAt: new Date().toISOString(),
        completedAt: null,
        actualDurationSeconds: null,
      });
    }
  }, [currentStepIndex, isTimerRunning, sessionFinished, sessionStartedAt, stepValues, steps, updateStepValues]);

  const finishActiveStep = useCallback(() => {
    if (!activeStepId) {
      return;
    }

    const values = stepValues[activeStepId];
    const duration = isCountdown
      ? Math.max(0, countdownStartRef.current - timerSeconds)
      : timerSeconds;

    countdownStartRef.current = 0;
    void completeStep(activeStepId, duration || (values?.actualDurationSeconds ?? 0));
  }, [activeStepId, completeStep, isCountdown, stepValues, timerSeconds]);

  const saveSession = useCallback(async () => {
    if (!profile?.id || !sessionStartedAt || sessionCompletedAt) {
      return;
    }

    const completedAt = new Date().toISOString();

    const totals = steps.reduce(
      (acc, step) => {
        const values = stepValues[step.id];
        const duration = values?.actualDurationSeconds ?? 0;

        if (step.type === "exercise") {
          const weight = values?.type === "exercise" ? values.weightKg ?? 0 : 0;
          acc.maxWeightKg = Math.max(acc.maxWeightKg, weight);
          acc.longestExerciseSeconds = Math.max(acc.longestExerciseSeconds, duration);
        }

        acc.totalDurationSeconds += duration;
        return acc;
      },
      { totalDurationSeconds: 0, maxWeightKg: 0, longestExerciseSeconds: 0 },
    );

    const payload: CreateTrainingSessionRecord = {
      userId: profile.id,
      sessionId,
      muscleGroup,
      sessionName,
      startedAt: sessionStartedAt,
      completedAt,
      totalDurationSeconds: totals.totalDurationSeconds,
      maxWeightKg: totals.maxWeightKg || null,
      longestExerciseSeconds: totals.longestExerciseSeconds || null,
      steps: steps.map((step) => {
        const values = stepValues[step.id];
        return {
          id: step.id,
          type: step.type,
          label: step.label,
          speedKmH:
            values?.type === "treadmill" ? values.speedKmH ?? null : null,
          durationSeconds: values?.actualDurationSeconds ?? null,
          weightKg: values?.type === "exercise" ? values.weightKg ?? null : null,
          sets: values?.type === "exercise" ? values.sets ?? null : null,
          repetitions: values?.type === "exercise" ? values.repetitions ?? null : null,
          startedAt: values?.startedAt ?? null,
          completedAt: values?.completedAt ?? null,
        };
      }),
    };

    setIsSaving(true);
    setGlobalError(null);
    try {
      await createTrainingSessionRecord(payload);
      setCompletionSummary({
        totalDurationSeconds: totals.totalDurationSeconds,
        maxWeightKg: totals.maxWeightKg || null,
        longestExerciseSeconds: totals.longestExerciseSeconds || null,
      });
      setSessionCompletedAt(completedAt);
    } catch (error) {
      console.error("Failed to store training session", error);
      setGlobalError("Не вдалося зберегти тренування. Перевірте підключення до Firebase.");
    } finally {
      setIsSaving(false);
    }
  }, [muscleGroup, profile?.id, sessionCompletedAt, sessionId, sessionName, sessionStartedAt, stepValues, steps]);
  useEffect(() => {
    if (!sessionStartedAt || sessionCompletedAt) {
      return;
    }

    const allCompleted = steps.every((step) => stepValues[step.id]?.completedAt);

    if (allCompleted) {
      void saveSession();
    }
  }, [saveSession, sessionCompletedAt, sessionStartedAt, stepValues, steps]);

  const stepProgress = `${currentStepIndex + 1}/${steps.length}`;
  const showTimer = Boolean(activeStep);

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-lg backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {muscleGroup}
            </p>
            <h1 className="text-xl font-semibold text-foreground">{sessionName}</h1>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Крок {stepProgress}</p>
          </div>
          {showTimer ? (
            <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-wide text-primary">
                {isCountdown ? "Зворотний відлік" : "Таймер"}
              </p>
              <p className="text-2xl font-semibold text-primary">{formatClock(timerSeconds)}</p>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={startCurrentStep}
            disabled={isTimerRunning || sessionFinished || isSaving}
            className="flex-1 rounded-2xl bg-primary/80 text-primary-foreground hover:bg-primary"
          >
            <PlayCircle className="h-5 w-5" aria-hidden="true" /> Почати крок
          </Button>
          {isTimerRunning ? (
            <Button
              variant="secondary"
              onClick={finishActiveStep}
              className="flex-1 rounded-2xl border border-secondary/40 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30"
            >
              Завершити
            </Button>
          ) : null}
        </div>
        {loadingHistory ? (
          <p className="mt-3 text-xs text-muted-foreground">Підвантажуємо попередні результати…</p>
        ) : null}
        {globalError ? (
          <p className="mt-3 rounded-2xl border border-secondary/40 bg-secondary/20 px-3 py-2 text-sm text-secondary-foreground">
            {globalError}
          </p>
        ) : null}
        {historyError ? (
          <p className="mt-3 text-xs text-secondary-foreground">{historyError}</p>
        ) : null}
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const values = stepValues[step.id];
          const isActive = index === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`rounded-3xl border p-4 shadow-inner transition ${
                isActive
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/50 bg-card/60"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {step.subtitle ?? (step.type === "treadmill" ? "Бігова доріжка" : "Вправа")}
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">{step.label}</h2>
                </div>
                {values?.actualDurationSeconds ? (
                  <div className="rounded-2xl border border-info/40 bg-info/10 px-3 py-1 text-xs text-info-foreground">
                    Тривалість: {formatDuration(values.actualDurationSeconds)}
                  </div>
                ) : null}
              </div>

              {step.type === "treadmill" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Швидкість (км/год)
                    </label>
                    <Input
                      inputMode="decimal"
                      value={values?.type === "treadmill" && values.speedKmH !== null ? values.speedKmH : ""}
                      onChange={(event) =>
                        updateStepValues(step.id, {
                          speedKmH: parseNumber(event.target.value),
                        })
                      }
                      disabled={sessionFinished || isSaving}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Тривалість (хв)
                    </label>
                    <Input
                      inputMode="decimal"
                      value={values?.type === "treadmill" && values.durationMinutes !== null ? values.durationMinutes : ""}
                      onChange={(event) =>
                        updateStepValues(step.id, {
                          durationMinutes: parseNumber(event.target.value),
                        })
                      }
                      disabled={sessionFinished || isSaving}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Вага (кг)
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-2xl border border-border/60"
                        onClick={() => adjustWeight(step.id, -1)}
                        disabled={sessionFinished || isSaving}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="relative flex-1">
                        <Weight className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          inputMode="decimal"
                          value={values?.type === "exercise" && values.weightKg !== null ? values.weightKg : ""}
                          onChange={(event) =>
                            updateStepValues(step.id, {
                              weightKg: parseNumber(event.target.value),
                            })
                          }
                          disabled={sessionFinished || isSaving}
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-2xl border border-border/60"
                        onClick={() => adjustWeight(step.id, 1)}
                        disabled={sessionFinished || isSaving}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Підходи
                    </label>
                    <Input
                      inputMode="numeric"
                      value={values?.type === "exercise" && values.sets !== null ? values.sets : ""}
                      onChange={(event) =>
                        updateStepValues(step.id, {
                          sets: parseNumber(event.target.value),
                        })
                      }
                      disabled={sessionFinished || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Повторення
                    </label>
                    <Input
                      inputMode="numeric"
                      value={values?.type === "exercise" && values.repetitions !== null ? values.repetitions : ""}
                      onChange={(event) =>
                        updateStepValues(step.id, {
                          repetitions: parseNumber(event.target.value),
                        })
                      }
                      disabled={sessionFinished || isSaving}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {completionSummary && sessionCompletedAt ? (
        <div className="rounded-3xl border border-primary/60 bg-primary/10 p-5 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-primary-foreground">Тренування завершено</h2>
              <p className="text-xs uppercase tracking-wide text-primary/80">
                {new Date(sessionCompletedAt).toLocaleString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/40 bg-background/80 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Час</p>
              <p className="text-lg font-semibold text-foreground">
                {formatDuration(completionSummary.totalDurationSeconds)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background/80 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Макс. вага</p>
              <p className="text-lg font-semibold text-foreground">
                {completionSummary.maxWeightKg ? `${completionSummary.maxWeightKg} кг` : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background/80 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Найдовша вправа</p>
              <p className="text-lg font-semibold text-foreground">
                {formatDuration(completionSummary.longestExerciseSeconds)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isSaving ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Зберігаємо результати…
        </div>
      ) : null}

      <div className="rounded-3xl border border-border/50 bg-card/60 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span>
            Перед кожною вправою та після комплексу розминка на біговій доріжці. Записуйте швидкість, час, вагу, повторення та підходи — вони збережуться для наступного тренування.
          </span>
        </div>
      </div>
    </section>
  );
}
