import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import type {
  CreateMobileUserInput,
  MobileUserProfile,
  UpdateMobileUserInput,
} from "@/types/mobile-app";

import { getDb } from "../db";

const COLLECTION = "mobileUsers";

export async function getMobileUser(deviceId: string): Promise<MobileUserProfile | null> {
  const db = getDb();
  const ref = doc(db, COLLECTION, deviceId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as MobileUserProfile;
}

export async function createMobileUser(
  payload: CreateMobileUserInput,
): Promise<MobileUserProfile> {
  const db = getDb();
  const ref = doc(db, COLLECTION, payload.deviceId);
  const timestamp = new Date().toISOString();
  const record: MobileUserProfile = {
    id: payload.deviceId,
    deviceId: payload.deviceId,
    displayName: payload.displayName,
    email: payload.email,
    pinHash: payload.pinHash,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLoginAt: timestamp,
  };

  await setDoc(ref, record);

  return record;
}

export async function updateMobileUser(
  deviceId: string,
  updates: UpdateMobileUserInput,
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, deviceId);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
}
