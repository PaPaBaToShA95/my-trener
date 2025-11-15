"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMobileAuth } from "@/components/auth/mobile-auth-gate";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/user/user-context";

const NAV_LINKS = [
  { href: "/", label: "Головна" },
  { href: "/workouts", label: "Мої тренування" },
  { href: "/statistics", label: "Моя статистика" },
  { href: "/profile", label: "Мій профіль" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { profile } = useUser();
  const { logout } = useMobileAuth();

  return (
    <header className="mb-6 space-y-4 text-foreground">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">My Trener</p>
          <h1 className="mt-1 text-2xl font-semibold text-primary">
            {profile?.name ?? "Атлет"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Твій мобільний гід по тренуваннях.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-2xl border border-border/60 bg-card/50 text-secondary hover:bg-secondary/10"
          onClick={logout}
          aria-label="Вийти"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-card/60 p-1 text-xs font-semibold uppercase">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-w-[160px] flex-1 items-center justify-center rounded-xl px-3 py-2 transition-all",
                isActive
                  ? "bg-primary/90 text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
