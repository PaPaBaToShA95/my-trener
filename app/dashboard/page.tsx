import { CalendarCheck2, Info, LineChart, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import SelectPlan from "./_components/select-plan";

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="muted">Тиждень 12 сезону</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="focus-ring rounded-full border border-border/60 bg-background p-1 text-muted-foreground shadow-sm"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Оновлюйте план щосуботи, щоб розподілити навантаження рівномірно.
              </TooltipContent>
            </Tooltip>
          </div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Панель керування
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Огляд запланованих тренувань, останніх результатів та швидких дій. Використовуйте підказки, щоб підтримувати сталість.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="gap-2">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Розпочати тренування
          </Button>
          <Button variant="outline" className="gap-2">
            <LineChart className="h-4 w-4" aria-hidden="true" />
            Переглянути динаміку
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Найближчі тренування
            </CardTitle>
            <CardDescription>
              Відстежуйте, скільки сесій залишилось до завершення тижня.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Поточний прогрес</span>
                <span className="font-semibold text-foreground">72%</span>
              </div>
              <Progress value={72} aria-label="Прогрес тренувань" />
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span>Силове тренування — вівторок</span>
                <Badge variant="success">Заплановано</Badge>
              </li>
              <li className="flex items-center justify-between rounded-lg px-3 py-2">
                <span>Кардіо та мобільність — четвер</span>
                <Badge variant="muted">У процесі</Badge>
              </li>
              <li className="flex items-center justify-between rounded-lg px-3 py-2">
                <span>Відновлення — неділя</span>
                <Badge variant="secondary">Гнучкий режим</Badge>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Оновіть план, щоб адаптувати навантаження під самопочуття.
            </p>
            <Button variant="ghost" size="sm" className="gap-1">
              Налаштувати
              <ChevronRightMini />
            </Button>
          </CardFooter>
        </Card>

        <Card className="space-y-0">
          <CardHeader>
            <CardTitle>Останній прогрес</CardTitle>
            <CardDescription>
              Порівняння ключових показників за останні тренування.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span>Максимальна вага жиму</span>
              <span className="font-semibold text-foreground">+5 кг</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span>Середня тривалість сесій</span>
              <span className="font-semibold text-foreground">-8 хв</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span>Сон та відновлення</span>
              <span className="font-semibold text-success">7.8 год</span>
            </div>
          </CardContent>
        </Card>

        <Card className="space-y-0">
          <CardHeader>
            <CardTitle>Швидкі дії</CardTitle>
            <CardDescription>
              Виконуйте типові задачі одним кліком.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="secondary" className="justify-between">
              Додати вимірювання
              <span className="text-xs text-muted-foreground">30 сек</span>
            </Button>
            <Button variant="outline" className="justify-between">
              Переглянути історію
              <span className="text-xs text-muted-foreground">останній тиждень</span>
            </Button>
            <Button variant="ghost" className="justify-between">
              Відмітити відпочинок
              <span className="text-xs text-muted-foreground">сьогодні</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <SelectPlan />
    </section>
  );
}

function ChevronRightMini() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 16 16"
    >
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
