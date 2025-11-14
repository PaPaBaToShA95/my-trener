"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

export interface UserPlanExercise {
  id: string;
  exerciseId?: string;
  name: string;
  sets: number;
  repetitions?: number;
  weightKg?: number;
}

export interface UserPlan {
  id: string;
  name: string;
  description?: string;
  exercises: UserPlanExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSnapshot {
  profile: UserProfile | null;
  plan: UserPlan | null;
}

export interface UserContextValue {
  profile: UserProfile | null;
  currentPlan: UserPlan | null;
  isLoading: boolean;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
  setCurrentPlan: Dispatch<SetStateAction<UserPlan | null>>;
  refresh: () => Promise<void>;
}

export interface UserProviderProps {
  children: ReactNode;
  initialProfile?: UserProfile | null;
  initialPlan?: UserPlan | null;
  fetcher?: () => Promise<UserSnapshot>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  children,
  initialProfile = null,
  initialPlan = null,
  fetcher,
}: UserProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(initialPlan);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(fetcher));

  const refresh = useCallback(async () => {
    if (!fetcher) {
      return;
    }

    setIsLoading(true);
    try {
      const snapshot = await fetcher();
      setProfile(snapshot?.profile ?? null);
      setCurrentPlan(snapshot?.plan ?? null);
    } catch (error) {
      console.error("Failed to refresh user session", error);
      setProfile(null);
      setCurrentPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (fetcher) {
      void refresh();
    }
  }, [fetcher, refresh]);

  const value = useMemo<UserContextValue>(
    () => ({
      profile,
      currentPlan,
      isLoading,
      setProfile,
      setCurrentPlan,
      refresh,
    }),
    [currentPlan, isLoading, profile, refresh]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
