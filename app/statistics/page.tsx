export default function StatisticsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Статистика</h1>
        <p className="text-sm text-slate-600">
          Відстежуйте прогрес за допомогою графіків та показників виконання тренувань.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Навантаження</h2>
          <p className="mt-2 text-sm text-slate-600">
            Тут буде відображено динаміку навантаження та інтенсивності вправ.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Досягнення</h2>
          <p className="mt-2 text-sm text-slate-600">
            Статистика персональних рекордів та послідовності тренувань.
          </p>
        </article>
      </div>
    </section>
  );
}
