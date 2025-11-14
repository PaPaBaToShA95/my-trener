"use client";

import { useMemo, useState } from "react";

import type { MuscleGroup, WorkoutTemplate } from "@/data/exercises";

import MuscleGroupSelect from "./muscle-group-select";
import WorkoutTemplateSelect from "./workout-template-select";

export default function WorkoutPlanner() {
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | undefined>();
  const [workout, setWorkout] = useState<WorkoutTemplate | undefined>();

  const statusMessage = useMemo(() => {
    if (muscleGroup && workout) {
      return `План тренування сфокусований на групі «${muscleGroup.name}» і включає ${workout.exercises.length} вправ.`;
    }

    if (muscleGroup) {
      return `Оберіть готову програму для групи «${muscleGroup.name}», щоб переглянути деталі.`;
    }

    return "Завантажуємо базові налаштування тренувань…";
  }, [muscleGroup, workout]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <MuscleGroupSelect
          value={muscleGroup?.id}
          onChange={(_, group) => {
            setMuscleGroup(group);
            setWorkout(undefined);
          }}
        />
        <WorkoutTemplateSelect
          value={workout?.id}
          muscleGroupId={muscleGroup?.id}
          onChange={(_, template) => {
            setWorkout(template);
          }}
        />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        {statusMessage}
      </div>
    </div>
  );
}
