import { notFound } from "next/navigation";

import WorkoutSessionLogger from "@/components/workout-session-logger";
import { exercises, workoutTemplates } from "@/data/exercises";

const exerciseLookup = new Map(exercises.map((exercise) => [exercise.id, exercise]));

interface WorkoutPageProps {
  params: { id: string };
}

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "—";
  }

  return `${minutes} хв`;
}

export default function WorkoutPage({ params }: WorkoutPageProps) {
  const workout = workoutTemplates.find((template) => template.id === params.id);

  if (!workout) {
    notFound();
  }

  const exerciseOptionsMap = new Map<
    string,
    {
      id: string;
      name: string;
      defaultSets?: number;
      defaultRepetitions?: number;
    }
  >();

  const workoutExercises = workout.exercises.map((exercise) => {
    const details = exerciseLookup.get(exercise.exerciseId);
    const option = {
      id: exercise.exerciseId,
      name: details?.name ?? exercise.exerciseId,
      defaultSets: exercise.sets ?? details?.defaultSets,
      defaultRepetitions: exercise.repetitions ?? details?.defaultRepetitions,
    };

    exerciseOptionsMap.set(option.id, option);

    return {
      ...option,
      sets: exercise.sets ?? details?.defaultSets ?? null,
      repetitions: exercise.repetitions ?? details?.defaultRepetitions ?? null,
      durationSeconds: exercise.durationSeconds ?? details?.defaultDurationSeconds ?? null,
      notes: exercise.notes ?? null,
    };
  });

  const exerciseOptions = Array.from(exerciseOptionsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "uk")
  );

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Тренування
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">{workout.title}</h1>
        <p className="text-sm text-slate-600">{workout.description}</p>
        <dl className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-slate-900">Фокус</dt>
            <dd>{workout.focus}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Рівень</dt>
            <dd>
              {workout.level === "beginner"
                ? "Початковий"
                : workout.level === "intermediate"
                  ? "Середній"
                  : "Просунутий"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Тривалість</dt>
            <dd>{formatDuration(workout.durationMinutes)}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Структура тренування</h2>
            <p className="mt-1 text-sm text-slate-600">
              Рекомендовані вправи та підходи для програми «{workout.title}».
            </p>
            <ul className="mt-4 space-y-3">
              {workoutExercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">{exercise.name}</span>
                    <span className="text-xs text-slate-500">
                      {exercise.sets ? `${exercise.sets} підходи` : null}
                      {exercise.sets && exercise.repetitions ? " · " : null}
                      {exercise.repetitions ? `${exercise.repetitions} повторень` : null}
                      {exercise.durationSeconds
                        ? ` · ${
                            exercise.durationSeconds >= 60
                              ? `${Math.round(exercise.durationSeconds / 60)} хв`
                              : `${exercise.durationSeconds} с`
                          }`
                        : null}
                    </span>
                  </div>
                  {exercise.notes ? (
                    <p className="mt-2 text-xs text-slate-600">{exercise.notes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {workout.notes?.length ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Поради</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                {workout.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <WorkoutSessionLogger
          workoutId={workout.id}
          workoutTitle={workout.title}
          exerciseOptions={exerciseOptions}
        />
      </div>
    </section>
  );
}
