import Link from "next/link";
import { Activity, BarChart3, ChevronRight, ClipboardList } from "lucide-react";

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

export default function HomePage() {
  return (
    <section className="space-y-12">
      <header className="space-y-6 rounded-3xl bg-gradient-to-br from-primary/15 via-background to-secondary/20 p-10 text-center shadow-sm md:text-left">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="space-y-4">
            <Badge variant="muted" className="bg-primary/10 text-primary">
              Новий досвід тренувань
            </Badge>
            <h1 className="text-balance font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Відстежуйте тренування та розвивайте силу системно
            </h1>
            <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              Плануйте тижневі сесії, отримуйте підказки щодо навантажень та спостерігайте за прогресом у зручній панелі керування.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard" className="inline-flex items-center gap-2">
                  Почати планування
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/statistics" className="inline-flex items-center gap-2">
                  Переглянути статистику
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <Card className="w-full max-w-sm border-none bg-background/80 shadow-lg backdrop-blur">
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

      <div className="grid gap-6 md:grid-cols-3">
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
    </section>
  );
}
