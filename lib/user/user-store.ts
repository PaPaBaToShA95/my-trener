import { randomUUID } from "crypto";

export interface StoredPlanExercise {
  id: string;
  exerciseId?: string;
  name: string;
  sets: number;
  repetitions?: number;
  weightKg?: number;
}

export interface StoredPlan {
  id: string;
  name: string;
  description?: string;
  exercises: StoredPlanExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredUser {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  activePlanId?: string | null;
  plan?: StoredPlan | null;
}

const globalForUserStore = globalThis as unknown as {
  __userStore?: Map<string, StoredUser>;
};

if (!globalForUserStore.__userStore) {
  globalForUserStore.__userStore = new Map<string, StoredUser>();
}

const userStore = globalForUserStore.__userStore;

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export function findUserByEmail(email: string): StoredUser | null {
  for (const user of userStore.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return user;
    }
  }
  return null;
}

export function createUser(data: CreateUserInput): StoredUser {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const user: StoredUser = {
    id,
    createdAt,
    updatedAt: createdAt,
    email: data.email,
    password: data.password,
    name: data.name,
    activePlanId: null,
    plan: null,
  };

  userStore.set(id, user);

  return user;
}

export function getUserById(id: string): StoredUser | null {
  return userStore.get(id) ?? null;
}

export interface PlanExerciseInput {
  id?: string;
  exerciseId?: string;
  name: string;
  sets: number;
  repetitions?: number;
  weightKg?: number;
}

export interface PlanInput {
  id?: string;
  name: string;
  description?: string;
  exercises: PlanExerciseInput[];
}

export function saveUserPlan(userId: string, plan: PlanInput): StoredPlan {
  const user = userStore.get(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const timestamp = new Date().toISOString();

  const exercises: StoredPlanExercise[] = plan.exercises.map((exercise) => ({
    id: exercise.id ?? randomUUID(),
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    sets: exercise.sets,
    repetitions: exercise.repetitions,
    weightKg: exercise.weightKg,
  }));

  const storedPlan: StoredPlan = {
    id: plan.id ?? user.plan?.id ?? randomUUID(),
    name: plan.name,
    description: plan.description,
    exercises,
    createdAt: user.plan?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  user.plan = storedPlan;
  user.activePlanId = storedPlan.id;
  user.updatedAt = timestamp;

  userStore.set(userId, user);

  return storedPlan;
}

export function sanitizeStoredUser(
  user: StoredUser
): Omit<StoredUser, "password"> {
  const { password: _password, ...rest } = user;
  void _password;

  return {
    ...rest,
    activePlanId: rest.activePlanId ?? null,
    plan: rest.plan ?? null,
  };
}
