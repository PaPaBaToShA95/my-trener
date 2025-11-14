import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { getDb } from "../db";

export interface WorkoutStats {
  id: string;
  userId: string;
  totalWorkouts: number;
  totalDurationSeconds?: number;
  totalVolumeKg?: number;
  updatedAt: string;
}

const COLLECTION = "workoutStats";

export async function createWorkoutStats(stats: WorkoutStats): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, stats.id);
  await setDoc(ref, stats);
}

export async function getWorkoutStats(statsId: string): Promise<WorkoutStats | null> {
  const db = getDb();
  const ref = doc(db, COLLECTION, statsId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as WorkoutStats) : null;
}

export async function updateWorkoutStats(
  statsId: string,
  updates: Partial<WorkoutStats>
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, statsId);
  await updateDoc(ref, updates);
}

export async function deleteWorkoutStats(statsId: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, statsId);
  await deleteDoc(ref);
}
