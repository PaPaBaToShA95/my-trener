import Link from "next/link";
import {
  Activity,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Dumbbell,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { trainingPrograms } from "@/data/training-programs";

export default function HomePage() {
  return (
    <section className="space-y-12">
      <header className="space-y-6 rounded-3xl bg-gradient-to-br from-primary/15 via-background to-secondary/20 px-6 py-12 text-center shadow-sm sm:p-10 md:text-left">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="space-y-5">
            <Badge variant="muted" className="bg-primary/10 text-primary">
              Новий досвід тренувань
            </Badge>
            <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Відстежуйте тренування та розвивайте силу системно
            </h1>
            <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              Плануйте тижневі сесії, отримуйте підказки щодо навантажень та спостерігайте за прогресом у зручній панелі керування.
            </p>
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/workouts" className="inline-flex items-center justify-center gap-2">
                  Почати тренування
                  <Dumbbell className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2">
                  Планувальник
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
                <Link href="/statistics" className="inline-flex items-center justify-center gap-2">
                  Переглянути статистику
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <Card className="w-full max-w-md border-none bg-background/80 shadow-lg backdrop-blur">
            <CardHeader className="border-none pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                Прогрес тижня
              </CardTitle>
              <CardDescription>
                5 із 7 тренувань завершено. Продовжуйте працювати у такому темпі!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={72} aria-label="Прогрес за тиждень" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Залишилося</span>
                <span className="text-foreground">2 сесії</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
              Розумний планер
            </CardTitle>
            <CardDescription>
              Формуйте персональні програми з адаптивними підказками для кожного тренування.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Вибирайте вправи, налаштовуйте підходи та вагу, а система контролюватиме баланс навантаження.
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-secondary-foreground" aria-hidden="true" />
              Прозора статистика
            </CardTitle>
            <CardDescription>
              Отримуйте звіти про прогрес, навантаження та відновлення у зрозумілих діаграмах.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Порівнюйте тижні, аналізуйте сильні та слабкі сторони, знаходьте ідеальні інтенсивність та обсяг.
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-success" aria-hidden="true" />
              Відчутний результат
            </CardTitle>
            <CardDescription>
              Простежуйте, як дисципліна перетворюється на силу завдяки щоденним мікрорезультатам.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Отримуйте мотиваційні індикатори прогресу, рекомендації з відпочинку та нагадування про гідратацію.
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Програма тренувань</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Готові тренувальні блоки для основних груп м’язів допоможуть швидко стартувати й урізноманітнити навантаження. Оберіть підхід та почніть сесію в один дотик.
            </p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/workouts" className="inline-flex items-center justify-center gap-2">
              Обрати тренування
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {trainingPrograms.map((program) => (
            <Card key={program.muscleGroup} className="h-full overflow-hidden">
              <CardHeader className="space-y-1">
                <Badge variant="outline" className="w-fit border-primary/40 bg-primary/5 text-xs uppercase tracking-wide text-primary">
                  {program.muscleGroup}
                </Badge>
                <CardTitle className="text-xl text-foreground">Комплекс тренувань</CardTitle>
                <CardDescription>
                  {program.sessions.length} сесій, з яких можна скласти інтенсивний спліт.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {program.sessions.map((session) => (
                  <div key={`${program.muscleGroup}-${session.name}`} className="rounded-xl border border-border/60 bg-background/60 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">
                      {session.name}
                    </h3>
                    <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {session.exercises.map((exercise, index) => (
                        <li key={exercise} className="flex gap-2">
                          <span className="font-medium text-primary">{index + 1}.</span>
                          <span className="flex-1">{exercise}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </section>
  );
}
