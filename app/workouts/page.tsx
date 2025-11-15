"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, PlayCircle } from "lucide-react";

import { trainingPrograms } from "@/data/training-programs";
import { buildSessionId } from "@/lib/training/sessions";

export default function WorkoutsPage() {
  const [openGroup, setOpenGroup] = useState<string | null>(
    trainingPrograms[0]?.muscleGroup ?? null,
  );

  return (
    <section className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Обери групу м’язів, розгорни програму та стартуй тренування. Усі сесії адаптовані під мобільний формат із чіткою структурою.
      </p>
      <div className="space-y-3">
        {trainingPrograms.map((program) => {
          const isOpen = openGroup === program.muscleGroup;

          return (
            <div
              key={program.muscleGroup}
              className="rounded-3xl border border-border/50 bg-card/70 p-4 shadow-lg backdrop-blur"
            >
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : program.muscleGroup)}
                className="flex w-full items-center justify-between gap-3"
              >
                <div className="text-left">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {program.sessions.length} сесій
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">{program.muscleGroup}</h2>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div className="mt-4 space-y-3">
                  {program.sessions.map((session) => {
                    const sessionId = buildSessionId(program.muscleGroup, session.name);

                    return (
                      <div
                        key={sessionId}
                        className="rounded-2xl border border-border/40 bg-background/70 p-4 shadow-inner"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-foreground">{session.name}</h3>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {session.exercises.length} вправ
                            </p>
                          </div>
                          <Link
                            href={`/workouts/${sessionId}`}
                            className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/30"
                          >
                            <PlayCircle className="h-5 w-5" aria-hidden="true" /> Почати
                          </Link>
                        </div>
                        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                          {session.exercises.map((exercise) => (
                            <li key={exercise}>{exercise}</li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
