export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroups: string[];
  equipment?: string;
  defaultSets?: number;
  defaultRepetitions?: number;
  defaultDurationSeconds?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  repetitions?: number;
  weightKg?: number;
  durationSeconds?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  performedAt: string; // ISO date string
  exercises: WorkoutExercise[];
  notes?: string;
  perceivedIntensity?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  heightCm?: number;
  weightKg?: number;
  goals?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  weeks: Array<{
    weekNumber: number;
    workouts: Array<{
      dayOfWeek: number; // 0 (Sunday) - 6 (Saturday)
      workoutId: string;
      focus?: string;
    }>;
  }>;
}
