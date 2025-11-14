"use client";

import { useCallback, useEffect, useState } from "react";

import type { UserProfile } from "@/lib/user/user-context";

interface UseCurrentUserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

async function fetchCurrentUser(): Promise<UserProfile | null> {
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  if (!userId) {
    return null;
  }

  const response = await fetch(`/api/users?id=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { user?: UserProfile };

  return payload?.user ?? null;
}

export function useCurrentUser(): UseCurrentUserState {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const nextUser = await fetchCurrentUser();
      setUser(nextUser);
    } catch (loadError) {
      console.error("Failed to fetch current user", loadError);
      setError("Не вдалося завантажити профіль користувача.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    refresh: loadUser,
  };
}
