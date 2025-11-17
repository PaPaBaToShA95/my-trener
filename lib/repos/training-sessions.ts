import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import type {
  CreateTrainingSessionRecord,
  TrainingSessionRecord,
} from "@/types/mobile-app";

import { getDb } from "../db";

const COLLECTION = "trainingSessionLogs";

export async function createTrainingSessionRecord(
  payload: CreateTrainingSessionRecord,
): Promise<string> {
  const db = getDb();
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, payload);
  return ref.id;
}

export async function getLatestTrainingSessionRecord(
  userId: string,
  sessionId: string,
): Promise<TrainingSessionRecord | null> {
  const db = getDb();
  const sessionsQuery = query(collection(db, COLLECTION), where("userId", "==", userId));

  const snapshot = await getDocs(sessionsQuery);
  const records = snapshot.docs
    .map((docSnapshot) => docSnapshot.data() as TrainingSessionRecord)
    .filter((record) => record.sessionId === sessionId)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

  return records[0] ?? null;
}

export async function listTrainingSessionRecords(
  userId: string,
): Promise<TrainingSessionRecord[]> {
  const db = getDb();
  const sessionsQuery = query(collection(db, COLLECTION), where("userId", "==", userId));

  const snapshot = await getDocs(sessionsQuery);

  return snapshot.docs
    .map((docSnapshot) => docSnapshot.data() as TrainingSessionRecord)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
}
