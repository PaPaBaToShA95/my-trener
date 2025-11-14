import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { getDb } from "../db";
import type {
  CreateWorkoutSessionLogInput,
  WorkoutSessionLog,
  WorkoutSessionLogFilters,
  WorkoutSessionSet,
} from "@/types/training";

const COLLECTION = "workoutSessions";

type FirestoreWorkoutSessionLog = {
  userId: string;
  workoutId: string;
  exerciseId: string;
  performedAt: string;
  sets: Array<{
    setNumber?: number;
    weightKg?: number | null;
    repetitions: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

function mapSet(set: FirestoreWorkoutSessionLog["sets"][number], index: number): WorkoutSessionSet {
  const weight = typeof set.weightKg === "number" && Number.isFinite(set.weightKg) ? set.weightKg : undefined;
  const setNumber = Number.isFinite(set.setNumber) ? Number(set.setNumber) : index + 1;

  return {
    setNumber,
    repetitions: set.repetitions,
    weightKg: weight,
  };
}

function mapSnapshotToSession(
  id: string,
  data: FirestoreWorkoutSessionLog
): WorkoutSessionLog {
  return {
    id,
    userId: data.userId,
    workoutId: data.workoutId,
    exerciseId: data.exerciseId,
    performedAt: data.performedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    sets: (data.sets ?? [])
      .map(mapSet)
      .sort((a, b) => a.setNumber - b.setNumber),
  };
}

export async function createWorkoutSessionLog(
  input: CreateWorkoutSessionLogInput
): Promise<WorkoutSessionLog> {
  const db = getDb();
  const timestamp = new Date().toISOString();
  const serializedSets: FirestoreWorkoutSessionLog["sets"] = input.sets.map((set, index) => ({
    setNumber: Number.isFinite(set.setNumber) ? Number(set.setNumber) : index + 1,
    repetitions: set.repetitions,
    weightKg:
      set.weightKg !== undefined && set.weightKg !== null && Number.isFinite(set.weightKg)
        ? Number.parseFloat(Number(set.weightKg).toFixed(2))
        : null,
  }));

  const payload: FirestoreWorkoutSessionLog = {
    userId: input.userId,
    workoutId: input.workoutId,
    exerciseId: input.exerciseId,
    performedAt: input.performedAt,
    sets: serializedSets,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const docRef = await addDoc(collection(db, COLLECTION), payload);

  return mapSnapshotToSession(docRef.id, payload);
}

export async function listWorkoutSessionLogs(
  filters: WorkoutSessionLogFilters
): Promise<WorkoutSessionLog[]> {
  const db = getDb();
  const constraints: QueryConstraint[] = [];

  if (filters.userId) {
    constraints.push(where("userId", "==", filters.userId));
  }

  if (filters.workoutId) {
    constraints.push(where("workoutId", "==", filters.workoutId));
  }

  if (filters.exerciseId) {
    constraints.push(where("exerciseId", "==", filters.exerciseId));
  }

  constraints.push(orderBy("performedAt", "desc"), orderBy("createdAt", "desc"));

  const sessionsQuery = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(sessionsQuery);

  return snapshot.docs.map((docSnapshot) =>
    mapSnapshotToSession(docSnapshot.id, docSnapshot.data() as FirestoreWorkoutSessionLog)
  );
}
