import { NextResponse } from "next/server";

import {
  createWorkoutSessionLog,
  listWorkoutSessionLogs,
} from "@/lib/repos/session-logs";
import type { CreateWorkoutSessionLogInput } from "@/types/training";

export const dynamic = "force-dynamic";

type IncomingSet = {
  repetitions?: unknown;
  weightKg?: unknown;
  setNumber?: unknown;
};

type IncomingPayload = {
  userId?: unknown;
  workoutId?: unknown;
  exerciseId?: unknown;
  performedAt?: unknown;
  sets?: IncomingSet[];
};

function normalizeIsoDate(value: string): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function parseWeight(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return undefined;
  }

  return Number.parseFloat(numericValue.toFixed(2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? undefined;
  const workoutId = searchParams.get("workoutId") ?? undefined;
  const exerciseId = searchParams.get("exerciseId") ?? undefined;

  if (!userId && !workoutId && !exerciseId) {
    return NextResponse.json(
      {
        error: "Вкажіть хоча б один параметр для фільтрації (userId, workoutId або exerciseId).",
      },
      { status: 400 }
    );
  }

  try {
    const sessions = await listWorkoutSessionLogs({ userId, workoutId, exerciseId });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to load workout session logs", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити історію тренувань." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as IncomingPayload;

  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const workoutId = typeof payload.workoutId === "string" ? payload.workoutId.trim() : "";
  const exerciseId = typeof payload.exerciseId === "string" ? payload.exerciseId.trim() : "";
  const performedAtRaw = typeof payload.performedAt === "string" ? payload.performedAt.trim() : "";

  if (!userId) {
    return NextResponse.json(
      { error: "Потрібен ідентифікатор користувача для збереження сесії." },
      { status: 400 }
    );
  }

  if (!workoutId) {
    return NextResponse.json(
      { error: "Потрібен ідентифікатор тренування." },
      { status: 400 }
    );
  }

  if (!exerciseId) {
    return NextResponse.json(
      { error: "Вкажіть вправу, яку виконуєте." },
      { status: 400 }
    );
  }

  if (!performedAtRaw) {
    return NextResponse.json(
      { error: "Вкажіть дату виконання." },
      { status: 400 }
    );
  }

  const performedAt = normalizeIsoDate(performedAtRaw);

  if (!performedAt) {
    return NextResponse.json(
      { error: "Невірний формат дати виконання." },
      { status: 400 }
    );
  }

  const setsInput = Array.isArray(payload.sets) ? payload.sets : [];

  if (!setsInput.length) {
    return NextResponse.json(
      { error: "Додайте хоча б один підхід." },
      { status: 400 }
    );
  }

  const normalizedSets: CreateWorkoutSessionLogInput["sets"] = [];

  for (let index = 0; index < setsInput.length; index += 1) {
    const set = setsInput[index];
    const repetitionsValue =
      typeof set?.repetitions === "number"
        ? set.repetitions
        : typeof set?.repetitions === "string"
          ? Number.parseInt(set.repetitions, 10)
          : Number.NaN;

    if (!Number.isFinite(repetitionsValue) || repetitionsValue <= 0) {
      return NextResponse.json(
        { error: `Невірна кількість повторень у підході ${index + 1}.` },
        { status: 400 }
      );
    }

    const weightValue = parseWeight(set?.weightKg);

    if (set?.weightKg !== undefined && set?.weightKg !== null && set?.weightKg !== "" && weightValue === undefined) {
      return NextResponse.json(
        { error: `Невірно вказана вага у підході ${index + 1}.` },
        { status: 400 }
      );
    }

    const setNumberValue =
      typeof set?.setNumber === "number"
        ? set.setNumber
        : typeof set?.setNumber === "string" && set.setNumber.trim()
          ? Number.parseInt(set.setNumber, 10)
          : index + 1;

    const setNumber = Number.isFinite(setNumberValue) && setNumberValue > 0 ? Math.trunc(setNumberValue) : index + 1;

    normalizedSets.push({
      setNumber,
      repetitions: Math.trunc(repetitionsValue),
      weightKg: weightValue,
    });
  }

  if (!normalizedSets.length) {
    return NextResponse.json(
      { error: "Не вдалося зберегти підходи. Повторіть спробу." },
      { status: 400 }
    );
  }

  try {
    const session = await createWorkoutSessionLog({
      userId,
      workoutId,
      exerciseId,
      performedAt,
      sets: normalizedSets,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Failed to create workout session log", error);
    return NextResponse.json(
      { error: "Не вдалося зберегти сесію. Спробуйте ще раз пізніше." },
      { status: 500 }
    );
  }
}
