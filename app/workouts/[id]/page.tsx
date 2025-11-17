import { notFound } from "next/navigation";

import { TrainingSessionRunner } from "@/components/training/training-session-runner";
import { findTrainingSessionById, getAllTrainingSessions } from "@/lib/training/sessions";

type WorkoutPageParams = { id: string };

interface WorkoutPageProps {
  params: WorkoutPageParams | Promise<WorkoutPageParams>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = await params;
  const resolved = findTrainingSessionById(id);

  if (!resolved) {
    notFound();
  }

  return (
    <TrainingSessionRunner
      sessionId={resolved.id}
      muscleGroup={resolved.muscleGroup}
      sessionName={resolved.session.name}
      exercises={resolved.session.exercises}
    />
  );
}

export function generateStaticParams() {
  return getAllTrainingSessions().map(({ id }) => ({ id }));
}
