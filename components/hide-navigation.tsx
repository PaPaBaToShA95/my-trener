"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { useNavigationVisibility } from "./navigation-visibility";

export function HideNavigation({ children }: { children: ReactNode }) {
  const { hideNavigation, showNavigation } = useNavigationVisibility();

  useLayoutEffect(() => {
    hideNavigation();

    return () => {
      showNavigation();
    };
  }, [hideNavigation, showNavigation]);

  return <>{children}</>;
}
