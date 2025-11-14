export default function WorkoutsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Тренування</h1>
        <p className="text-sm text-slate-600">
          Створюйте та організовуйте тренування за типом, інтенсивністю та групами м’язів.
        </p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Список тренувань</h2>
        <p className="mt-2 text-sm text-slate-600">
          Тут з’являться збережені програми та улюблені комплекси вправ.
        </p>
      </div>
    </section>
  );
}
