import { trainingPrograms } from "@/data/training-programs";
import type { TrainingProgram, TrainingSession } from "@/data/training-programs";
import { slugify } from "@/lib/slugify";

export interface ResolvedTrainingSession {
  id: string;
  muscleGroup: string;
  program: TrainingProgram;
  session: TrainingSession;
}

export function buildSessionId(muscleGroup: string, sessionName: string): string {
  return slugify(`${muscleGroup}-${sessionName}`);
}

export function getAllTrainingSessions(): ResolvedTrainingSession[] {
  return trainingPrograms.flatMap((program) =>
    program.sessions.map((session) => ({
      id: buildSessionId(program.muscleGroup, session.name),
      muscleGroup: program.muscleGroup,
      program,
      session,
    })),
  );
}

export function findTrainingSessionById(id: string): ResolvedTrainingSession | null {
  for (const program of trainingPrograms) {
    for (const session of program.sessions) {
      if (buildSessionId(program.muscleGroup, session.name) === id) {
        return { id, muscleGroup: program.muscleGroup, program, session };
      }
    }
  }

  return null;
}
