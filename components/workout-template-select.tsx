"use client";

import { useEffect, useMemo, useState } from "react";

import type { Exercise } from "@/types/training";
import type { WorkoutTemplate } from "@/data/exercises";

interface WorkoutTemplateSelectProps {
  label?: string;
  helperText?: string;
  value?: string;
  muscleGroupId?: string;
  onChange?: (workoutId: string | undefined, workout?: WorkoutTemplate) => void;
  disabled?: boolean;
}

interface FetchState {
  loading: boolean;
  error?: string;
}

export default function WorkoutTemplateSelect({
  label = "Готова програма",
  helperText = "Обирайте тренування на основі цілей та доступних вправ.",
  value,
  muscleGroupId,
  onChange,
  disabled,
}: WorkoutTemplateSelectProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [selectedId, setSelectedId] = useState<string | undefined>(value);
  const [state, setState] = useState<FetchState>({ loading: true });

  useEffect(() => {
    setSelectedId(value);
  }, [value]);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkouts() {
      setState({ loading: true });
      try {
        const [workoutsResponse, exercisesResponse] = await Promise.all([
          fetch("/api/workouts"),
          fetch("/api/exercises"),
        ]);

        if (!workoutsResponse.ok) {
          throw new Error(`Не вдалося завантажити тренування (${workoutsResponse.status}).`);
        }

        if (!exercisesResponse.ok) {
          throw new Error(`Не вдалося завантажити вправи (${exercisesResponse.status}).`);
        }

        const workoutsPayload: { workouts: WorkoutTemplate[] } =
          await workoutsResponse.json();
        const exercisesPayload: { exercises: Exercise[] } = await exercisesResponse.json();

        if (!isMounted) {
          return;
        }

        setTemplates(workoutsPayload.workouts);
        setExercises(
          exercisesPayload.exercises.reduce<Record<string, Exercise>>((acc, exercise) => {
            acc[exercise.id] = exercise;
            return acc;
          }, {})
        );
        setState({ loading: false });
      } catch (error) {
        console.error(error);
        if (!isMounted) {
          return;
        }
        setState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Сталася невідома помилка під час завантаження тренувань.",
        });
      }
    }

    loadWorkouts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!muscleGroupId) {
      return templates;
    }
    return templates.filter((template) => template.muscleGroups.includes(muscleGroupId));
  }, [templates, muscleGroupId]);

  useEffect(() => {
    if (state.loading || filteredTemplates.length === 0) {
      return;
    }

    const hasSelected = filteredTemplates.some((template) => template.id === selectedId);
    const nextId = value ?? (hasSelected ? selectedId : filteredTemplates[0]!.id);

    if (nextId && nextId !== selectedId) {
      setSelectedId(nextId);
      const workout = filteredTemplates.find((item) => item.id === nextId);
      onChange?.(nextId, workout);
    }
  }, [state.loading, filteredTemplates, selectedId, value, onChange]);

  useEffect(() => {
    if (!state.loading && filteredTemplates.length === 0 && selectedId) {
      setSelectedId(undefined);
      onChange?.(undefined, undefined);
    }
  }, [state.loading, filteredTemplates, selectedId, onChange]);

  const selectedTemplate = useMemo(
    () => filteredTemplates.find((template) => template.id === selectedId),
    [filteredTemplates, selectedId]
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-900">{label}</label>
        <select
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          value={selectedId ?? ""}
          onChange={(event) => {
            const nextId = event.target.value;
            setSelectedId(nextId);
            const workout = filteredTemplates.find((item) => item.id === nextId);
            onChange?.(nextId, workout);
          }}
          disabled={disabled || state.loading || filteredTemplates.length === 0}
        >
          {state.loading ? (
            <option value="">Завантаження…</option>
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((workout) => (
              <option key={workout.id} value={workout.id}>
                {workout.title} · {workout.level === "beginner"
                  ? "Початковий"
                  : workout.level === "intermediate"
                  ? "Середній"
                  : "Просунутий"}
              </option>
            ))
          ) : (
            <option value="">Немає доступних тренувань</option>
          )}
        </select>
        {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
        {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
      </div>
      {selectedTemplate ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{selectedTemplate.title}</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
              {selectedTemplate.level === "beginner"
                ? "Початковий рівень"
                : selectedTemplate.level === "intermediate"
                ? "Середній рівень"
                : "Просунутий рівень"}
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
              ⏱ {selectedTemplate.durationMinutes} хв
            </span>
          </div>
          <p className="mt-1 leading-relaxed text-slate-600">{selectedTemplate.description}</p>
          <div className="mt-3 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Вправи
            </h4>
            <ul className="space-y-1 text-xs text-slate-600">
              {selectedTemplate.exercises.map((item) => {
                const exercise = exercises[item.exerciseId];
                const title = exercise?.name ?? item.exerciseId;
                const details = [] as string[];
                if (item.repetitions) {
                  details.push(`${item.repetitions} повторень`);
                }
                if (item.durationSeconds) {
                  details.push(`${item.durationSeconds} с`);
                }
                return (
                  <li key={`${item.exerciseId}-${item.sets}`} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                    <div>
                      <span className="font-medium text-slate-700">{title}</span>
                      <span className="block text-slate-500">
                        {item.sets} підходів
                        {details.length ? ` · ${details.join(" · ")}` : ""}
                      </span>
                      {item.notes ? (
                        <span className="block text-[11px] text-slate-500">{item.notes}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          {selectedTemplate.notes?.length ? (
            <div className="mt-3 space-y-1 text-[11px] text-slate-500">
              {selectedTemplate.notes.map((note) => (
                <p key={note}>• {note}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
