"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  Loader2,
  Timer,
  Trophy,
  TrendingUp,
  Weight,
} from "lucide-react";

import { useUser } from "@/lib/user/user-context";
import { listTrainingSessionRecords } from "@/lib/repos/training-sessions";
import type { TrainingSessionRecord } from "@/types/mobile-app";

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "—";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours) {
    parts.push(`${hours} год`);
  }
  if (minutes) {
    parts.push(`${minutes} хв`);
  }
  if (!parts.length) {
    parts.push(`${remainingSeconds} с`);
  }

  return parts.join(" ");
}

function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StatisticsPage() {
  const { profile } = useUser();
  const [records, setRecords] = useState<TrainingSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sessions = await listTrainingSessionRecords(profile.id);
        if (isMounted) {
          setRecords(sessions);
        }
      } catch (loadError) {
        console.error("Failed to load statistics", loadError);
        if (isMounted) {
          setError("Не вдалося отримати статистику. Перевірте підключення до Firebase.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  const summary = useMemo(() => {
    if (!records.length) {
      return {
        totalDuration: 0,
        maxWeight: 0,
        longestExercise: 0,
      };
    }

    return records.reduce(
      (acc, record) => {
        acc.totalDuration += record.totalDurationSeconds;
        acc.maxWeight = Math.max(acc.maxWeight, record.maxWeightKg ?? 0);
        acc.longestExercise = Math.max(acc.longestExercise, record.longestExerciseSeconds ?? 0);
        return acc;
      },
      { totalDuration: 0, maxWeight: 0, longestExercise: 0 },
    );
  }, [records]);

  const recent = records.slice(0, 6);

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold text-foreground">Моя статистика</h1>
        <p className="text-sm text-muted-foreground">
          Слідкуй за часом тренувань, максимальними вагами та останніми результатами.
        </p>
      </header>

      {error ? (
        <div className="rounded-3xl border border-secondary/40 bg-secondary/15 px-4 py-3 text-sm text-secondary-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-border/60 bg-card/70 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Тривалість</p>
              <p className="text-lg font-semibold text-foreground">{formatDuration(summary.totalDuration)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card/70 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-secondary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Максимальна вага</p>
              <p className="text-lg font-semibold text-foreground">
                {summary.maxWeight ? `${summary.maxWeight} кг` : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card/70 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-info" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Найдовша вправа</p>
              <p className="text-lg font-semibold text-foreground">
                {formatDuration(summary.longestExercise)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/70 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Останні тренування</h2>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{records.length} записів</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Завантажуємо дані…
          </div>
        ) : recent.length ? (
          <ul className="mt-4 space-y-3">
            {recent.map((record) => (
              <li
                key={record.id}
                className="rounded-2xl border border-border/40 bg-background/60 p-4 shadow-inner"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{record.sessionName}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {record.muscleGroup}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-xl border border-border/40 px-2 py-1">
                      <CalendarClock className="h-4 w-4" /> {formatDate(record.completedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl border border-border/40 px-2 py-1">
                      <Timer className="h-4 w-4" /> {formatDuration(record.totalDurationSeconds)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl border border-border/40 px-2 py-1">
                      <Weight className="h-4 w-4" />
                      {record.maxWeightKg ? `${record.maxWeightKg} кг` : "—"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Ще немає збережених тренувань. Запустіть сесію, щоб побачити статистику.
          </p>
        )}
      </div>
    </section>
  );
}
