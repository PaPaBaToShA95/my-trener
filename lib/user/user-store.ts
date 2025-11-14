import { randomUUID } from "crypto";

export interface StoredUser {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: string;
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
    email: data.email,
    password: data.password,
    name: data.name,
  };

  userStore.set(id, user);

  return user;
}

export function getUserById(id: string): StoredUser | null {
  return userStore.get(id) ?? null;
}
