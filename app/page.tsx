import Link from "next/link";
import { BarChart3, Dumbbell, UserRound } from "lucide-react";

const MENU_ITEMS = [
  {
    href: "/workouts",
    label: "Мої тренування",
    description: "Обирай групу м’язів, дивись вправи та запускай сесію за хвилину.",
    icon: Dumbbell,
    accent: "from-primary/30 via-primary/10 to-transparent",
  },
  {
    href: "/statistics",
    label: "Моя статистика",
    description: "Переглядай час тренувань, максимальні ваги та прогрес за останні сесії.",
    icon: BarChart3,
    accent: "from-secondary/30 via-secondary/10 to-transparent",
  },
  {
    href: "/profile",
    label: "Мій профіль",
    description: "Керуйте PIN-доступом, оновлюйте імʼя та синхронізацію пристрою.",
    icon: UserRound,
    accent: "from-info/30 via-info/10 to-transparent",
  },
];

export default function HomePage() {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/50 bg-card/70 p-4 shadow-lg backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Повертаєтесь?</p>
          <p className="text-sm text-muted-foreground">Увійдіть, щоб продовжити прогрес із будь-якого пристрою.</p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/25"
        >
          Вже маєте акаунт? Увійти
        </Link>
      </div>
      <div className="grid gap-4">
        {MENU_ITEMS.map(({ href, label, description, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className="group relative block overflow-hidden rounded-3xl border border-border/50 bg-card/70 p-5 shadow-lg backdrop-blur transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
              aria-hidden
            />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 text-primary shadow-inner">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
