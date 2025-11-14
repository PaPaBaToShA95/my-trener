"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/user/user-context";

interface RequireUserOptions {
  redirectTo?: string;
  requirePlan?: boolean;
  planFallback?: string;
}

export function useRequireUser(options: RequireUserOptions = {}) {
  const {
    redirectTo = "/login",
    requirePlan = false,
    planFallback = "/plans",
  } = options;
  const { profile, currentPlan, isLoading, refresh } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!profile) {
      const redirectUrl = new URL(redirectTo, window.location.origin);
      redirectUrl.searchParams.set("redirectTo", pathname);
      router.replace(redirectUrl.toString());
      return;
    }

    if (requirePlan && !currentPlan) {
      router.replace(planFallback);
    }
  }, [
    currentPlan,
    isLoading,
    planFallback,
    profile,
    redirectTo,
    requirePlan,
    pathname,
    router,
  ]);

  return { profile, currentPlan, isLoading, refresh };
}
