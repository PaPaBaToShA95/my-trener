"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface NavigationVisibilityContextValue {
  isVisible: boolean;
  showNavigation: () => void;
  hideNavigation: () => void;
}

const NavigationVisibilityContext = createContext<NavigationVisibilityContextValue | null>(
  null,
);

export function NavigationVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(true);

  const showNavigation = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideNavigation = useCallback(() => {
    setIsVisible(false);
  }, []);

  const value = useMemo(
    () => ({
      isVisible,
      showNavigation,
      hideNavigation,
    }),
    [hideNavigation, isVisible, showNavigation],
  );

  return (
    <NavigationVisibilityContext.Provider value={value}>
      {children}
    </NavigationVisibilityContext.Provider>
  );
}

export function useNavigationVisibility() {
  const context = useContext(NavigationVisibilityContext);

  if (!context) {
    throw new Error(
      "useNavigationVisibility must be used within a NavigationVisibilityProvider",
    );
  }

  return context;
}
