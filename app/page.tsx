export default function HomePage() {
  return (
    <section className="space-y-8">
      <header className="space-y-4 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Відстежуйте свої тренування та прогрес
        </h1>
        <p className="text-lg text-slate-600">
          Плануйте тренування, контролюйте навантаження та аналізуйте досягнення у зручній панелі.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Розумний планер</h2>
          <p className="mt-2 text-sm text-slate-600">
            Формуйте тижневі програми тренувань і відстежуйте виконання кожного заняття.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Прозора статистика</h2>
          <p className="mt-2 text-sm text-slate-600">
            Аналізуйте прогрес завдяки зручним графікам та звітам по навантаженнях.
          </p>
        </article>
      </div>
    </section>
  );
}
