import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getUserById,
  saveUserPlan,
  sanitizeStoredUser,
  type PlanExerciseInput,
  type PlanInput,
} from "@/lib/user/user-store";

async function resolveUser() {
  const cookieStore = await Promise.resolve(cookies());
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return { error: "Необхідна авторизація.", status: 401 } as const;
  }

  const user = getUserById(token);

  if (!user) {
    return { error: "Користувача не знайдено.", status: 404 } as const;
  }

  return { user } as const;
}

function parsePlan(payload: unknown):
  | { plan: PlanInput }
  | { error: string } {
  if (!payload || typeof payload !== "object") {
    return { error: "Невірний формат плану." };
  }

  const raw = payload as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (!name) {
    return { error: "Додайте назву плану." };
  }

  const description =
    typeof raw.description === "string" ? raw.description.trim() : undefined;

  const exercisesPayload = Array.isArray(raw.exercises) ? raw.exercises : [];

  if (exercisesPayload.length === 0) {
    return { error: "План повинен містити принаймні одну вправу." };
  }

  const exercises: PlanExerciseInput[] = [];

  for (const exercisePayload of exercisesPayload) {
    if (!exercisePayload || typeof exercisePayload !== "object") {
      return { error: "Невірні дані про вправу." };
    }

    const exercise = exercisePayload as Record<string, unknown>;
    const exerciseName =
      typeof exercise.name === "string" ? exercise.name.trim() : "";

    if (!exerciseName) {
      return { error: "Кожна вправа повинна мати назву." };
    }

    const setsValue = Number(exercise.sets);

    if (!Number.isFinite(setsValue) || setsValue <= 0) {
      return { error: "Кількість підходів повинна бути додатнім числом." };
    }

    const repetitionsValue =
      exercise.repetitions === undefined || exercise.repetitions === null ||
      exercise.repetitions === ""
        ? undefined
        : Number(exercise.repetitions);

    if (
      repetitionsValue !== undefined &&
      (!Number.isFinite(repetitionsValue) || repetitionsValue <= 0)
    ) {
      return { error: "Кількість повторень повинна бути додатнім числом." };
    }

    const weightValue =
      exercise.weightKg === undefined ||
      exercise.weightKg === null ||
      exercise.weightKg === ""
        ? undefined
        : Number(exercise.weightKg);

    if (weightValue !== undefined && !Number.isFinite(weightValue)) {
      return { error: "Вага повинна бути числом." };
    }

    const planExercise: PlanExerciseInput = {
      id:
        typeof exercise.id === "string" && exercise.id.trim()
          ? exercise.id
          : undefined,
      exerciseId:
        typeof exercise.exerciseId === "string" && exercise.exerciseId.trim()
          ? exercise.exerciseId
          : undefined,
      name: exerciseName,
      sets: Math.trunc(setsValue),
      repetitions:
        repetitionsValue !== undefined
          ? Math.trunc(repetitionsValue)
          : undefined,
      weightKg:
        weightValue !== undefined
          ? Number.parseFloat(weightValue.toFixed(2))
          : undefined,
    };

    exercises.push(planExercise);
  }

  const plan: PlanInput = {
    id:
      typeof raw.id === "string" && raw.id.trim() ? (raw.id as string) : undefined,
    name,
    description,
    exercises,
  };

  return { plan };
}

export async function GET() {
  const result = await resolveUser();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { user } = result;

  return NextResponse.json({
    profile: sanitizeStoredUser(user),
    plan: user.plan ?? null,
  });
}

export async function POST(request: Request) {
  const result = await resolveUser();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { user } = result;
  const payload = await request.json().catch(() => ({}));
  const parsed = parsePlan((payload as Record<string, unknown>)?.plan);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const savedPlan = saveUserPlan(user.id, parsed.plan);
  const refreshedUser = getUserById(user.id);

  return NextResponse.json({
    profile: refreshedUser ? sanitizeStoredUser(refreshedUser) : null,
    plan: savedPlan,
  });
}
