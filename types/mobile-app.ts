export interface MobileUserProfile {
  id: string;
  deviceId: string;
  displayName: string;
  email?: string;
  pinHash: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type CreateMobileUserInput = {
  deviceId: string;
  displayName: string;
  email?: string;
  pinHash: string;
};

export type UpdateMobileUserInput = Partial<Pick<MobileUserProfile, "displayName" | "email" | "pinHash" | "lastLoginAt">>;

export interface TrainingStepRecord {
  id: string;
  type: "treadmill" | "exercise";
  label: string;
  speedKmH?: number | null;
  durationSeconds?: number | null;
  weightKg?: number | null;
  sets?: number | null;
  repetitions?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface TrainingSessionRecord {
  id: string;
  userId: string;
  sessionId: string;
  muscleGroup: string;
  sessionName: string;
  startedAt: string;
  completedAt: string;
  totalDurationSeconds: number;
  maxWeightKg?: number | null;
  longestExerciseSeconds?: number | null;
  steps: TrainingStepRecord[];
  notes?: string;
}

export type CreateTrainingSessionRecord = Omit<TrainingSessionRecord, "id">;
