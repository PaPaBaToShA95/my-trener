import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
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
  const sessionsQuery = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("sessionId", "==", sessionId),
    orderBy("completedAt", "desc"),
    limit(1),
  );

  const snapshot = await getDocs(sessionsQuery);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0]!.data() as TrainingSessionRecord;
}

export async function listTrainingSessionRecords(
  userId: string,
): Promise<TrainingSessionRecord[]> {
  const db = getDb();
  const sessionsQuery = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("completedAt", "desc"),
  );

  const snapshot = await getDocs(sessionsQuery);

  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as TrainingSessionRecord);
}
