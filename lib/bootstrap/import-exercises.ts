import { exerciseDataset } from "@/data/exercises";
import type { ExerciseDataset, MuscleGroup, WorkoutTemplate } from "@/data/exercises";
import { getDb, getFirebaseApp } from "@/lib/db";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";

let importPromise: Promise<void> | null = null;

const DATASET_BLOB_PATH = "seed/exercises.json";

async function uploadToVercelBlob(dataset: ExerciseDataset) {
  const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return false;
  }

  const { list, put } = await import("@vercel/blob");

  const existing = await list({
    prefix: DATASET_BLOB_PATH,
    token,
  });

  if (existing.blobs?.some((blob) => blob.pathname === DATASET_BLOB_PATH)) {
    return true;
  }

  try {
    await put(DATASET_BLOB_PATH, JSON.stringify(dataset, null, 2), {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
    });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? (error as { status?: number }).status : null;
    const message = error instanceof Error ? error.message : "";
    if (status === 412 || message.includes("412")) {
      return true;
    }
    throw error;
  }

  return true;
}

async function uploadToFirestore(dataset: ExerciseDataset) {
  try {
    getFirebaseApp();
  } catch (error) {
    console.warn("Skipping Firestore seeding: Firebase is not configured.", error);
    return false;
  }

  const db = getDb();
  const metadataRef = doc(db, "metadata", "exercise-dataset");
  const snapshot = await getDoc(metadataRef);

  if (snapshot.exists()) {
    const storedVersion = snapshot.data()?.version;
    if (storedVersion === dataset.version) {
      return true;
    }
  }

  const batch = writeBatch(db);

  const muscleCollection = collection(db, "muscleGroups");
  dataset.muscleGroups.forEach((group: MuscleGroup) => {
    batch.set(doc(muscleCollection, group.id), group, { merge: true });
  });

  const exerciseCollection = collection(db, "exercises");
  dataset.exercises.forEach((exercise) => {
    batch.set(doc(exerciseCollection, exercise.id), exercise, { merge: true });
  });

  const workoutCollection = collection(db, "workoutTemplates");
  dataset.workoutTemplates.forEach((workout: WorkoutTemplate) => {
    batch.set(doc(workoutCollection, workout.id), workout, { merge: true });
  });

  batch.set(
    metadataRef,
    {
      version: dataset.version,
      updatedAt: dataset.updatedAt,
      lastSeededAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await batch.commit();

  return true;
}

async function importExercisesInternal(): Promise<void> {
  const dataset = exerciseDataset;

  const targets = [
    () => uploadToVercelBlob(dataset),
    () => uploadToFirestore(dataset),
  ];

  let imported = false;
  let lastError: unknown = null;

  for (const attempt of targets) {
    try {
      const result = await attempt();
      if (result) {
        imported = true;
      }
    } catch (error) {
      lastError = error;
      console.error("Failed to import exercise dataset", error);
    }
  }

  if (!imported) {
    if (lastError) {
      throw lastError;
    }

    console.info(
      "Exercise dataset import skipped: no compatible storage target configured."
    );
  }
}

export async function ensureExerciseDatasetImported(): Promise<void> {
  if (!importPromise) {
    importPromise = importExercisesInternal().catch((error) => {
      importPromise = null;
      throw error;
    });
  }

  return importPromise;
}
