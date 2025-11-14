"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold text-slate-900">My Trener</span>
        <ul className="flex items-center gap-6 text-sm font-medium text-slate-700">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    "transition-colors hover:text-slate-900 " +
                    (isActive ? "text-slate-900" : "text-slate-600")
                  }
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
