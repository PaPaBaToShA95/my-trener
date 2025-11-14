import Link from "next/link";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-8 shadow-sm">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Створити акаунт</h1>
        <p className="mt-2 text-sm text-slate-600">
          Зареєструйтесь, щоб відстежувати власні тренування та прогрес.
        </p>
      </header>
      <form className="flex flex-col gap-4">
        <input
          className="rounded-md border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Електронна пошта"
          type="email"
        />
        <input
          className="rounded-md border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Пароль"
          type="password"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Зареєструватись
        </button>
      </form>
      <p className="text-sm text-slate-500">
        Вже маєте акаунт?{" "}
        <Link href="/login" className="text-slate-900 underline">
          Увійти
        </Link>
      </p>
    </section>
  );
}
