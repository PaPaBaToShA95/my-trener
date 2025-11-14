import { NextResponse } from "next/server";

import { workoutTemplates } from "@/data/exercises";
import { ensureExerciseDatasetImported } from "@/lib/bootstrap/import-exercises";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureExerciseDatasetImported();

  return NextResponse.json({
    workouts: workoutTemplates,
  });
}
