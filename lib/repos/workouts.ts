import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { getDb } from "../db";
import type { Workout } from "../../types/training";

const COLLECTION = "workouts";

export async function createWorkout(workout: Workout): Promise<string> {
  const db = getDb();
  const ref = doc(db, COLLECTION, workout.id);
  await setDoc(ref, workout);
  return ref.id;
}

export async function getWorkout(workoutId: string): Promise<Workout | null> {
  const db = getDb();
  const ref = doc(db, COLLECTION, workoutId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as Workout) : null;
}

export async function updateWorkout(
  workoutId: string,
  updates: Partial<Workout>
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, workoutId);
  await updateDoc(ref, updates);
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, workoutId);
  await deleteDoc(ref);
}

export async function listWorkoutsForUser(userId: string): Promise<Workout[]> {
  const db = getDb();
  const workoutsQuery = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snapshot = await getDocs(workoutsQuery);
  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as Workout);
}
