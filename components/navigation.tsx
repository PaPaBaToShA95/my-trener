"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigationVisibility } from "./navigation-visibility";

const links = [
  { href: "/", label: "Головна" },
  { href: "/dashboard", label: "Панель" },
  { href: "/workouts", label: "Тренування" },
  { href: "/statistics", label: "Статистика" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isVisible } = useNavigationVisibility();

  if (!isVisible) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-semibold text-foreground">
            My Trener
          </span>
          <Badge variant="muted" className="hidden border border-primary/30 text-xs text-primary sm:inline-flex">
            Beta
          </Badge>
        </Link>
        <ul className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 p-1 text-sm font-medium text-muted-foreground">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
