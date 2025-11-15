import { notFound } from "next/navigation";

import { TrainingSessionRunner } from "@/components/training/training-session-runner";
import { findTrainingSessionById } from "@/lib/training/sessions";

interface WorkoutPageProps {
  params: { id: string };
}

export default function WorkoutPage({ params }: WorkoutPageProps) {
  const resolved = findTrainingSessionById(params.id);

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
