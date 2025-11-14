import WorkoutPlanner from "@/components/workout-planner";

export default function WorkoutsPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Тренування</h1>
        <p className="text-sm text-slate-600">
          Створюйте та організовуйте тренування за типом, інтенсивністю та групами м’язів.
        </p>
      </header>
      <WorkoutPlanner />
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Ваші програми</h2>
        <p className="mt-2 text-sm text-slate-600">
          Збережені тренування з’являться тут, щойно ви створите власні комбінації або додасте обрані програми.
        </p>
      </div>
    </section>
  );
}
