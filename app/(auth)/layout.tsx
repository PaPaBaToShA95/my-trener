import type { ReactNode } from "react";
import { HideNavigation } from "@/components/hide-navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <HideNavigation>{children}</HideNavigation>;
}
