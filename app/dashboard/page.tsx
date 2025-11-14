export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Панель керування</h1>
        <p className="text-sm text-slate-600">
          Огляд запланованих тренувань, останніх результатів та швидких дій.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Найближчі тренування</h2>
          <p className="mt-2 text-sm text-slate-600">
            Тут з’являться заплановані сесії на поточний тиждень.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Останній прогрес</h2>
          <p className="mt-2 text-sm text-slate-600">
            Порівняння ключових показників за останні тренування.
          </p>
        </article>
      </div>
    </section>
  );
}
