import { doc, deleteDoc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { getDb } from "../db";
import type { UserProfile } from "../../types/training";

const COLLECTION = "users";

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, profile.id);
  await setDoc(ref, profile);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getDb();
  const ref = doc(db, COLLECTION, userId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, userId);
  await updateDoc(ref, updates);
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, userId);
  await deleteDoc(ref);
}
