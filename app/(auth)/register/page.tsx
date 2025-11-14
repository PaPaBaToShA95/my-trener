"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.currentTarget;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(
          payload?.error ?? "Не вдалося створити акаунт. Спробуйте ще раз."
        );
        return;
      }

      const payload = (await response.json()) as {
        user?: { id: string };
      };

      const userId = payload?.user?.id;

      if (userId && typeof window !== "undefined") {
        localStorage.setItem("user_id", userId);
      }

      router.push("/dashboard");
    } catch (apiError) {
      console.error("Failed to register user", apiError);
      setError("Сталася несподівана помилка. Спробуйте ще раз пізніше.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-8 shadow-sm">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Створити акаунт</h1>
        <p className="mt-2 text-sm text-slate-600">
          Зареєструйтесь, щоб відстежувати власні тренування та прогрес.
        </p>
      </header>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="rounded-md border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Ім'я"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          className="rounded-md border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Електронна пошта"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="rounded-md border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Пароль"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Створення..." : "Зареєструватись"}
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
