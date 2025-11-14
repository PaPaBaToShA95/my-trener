import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createUser,
  findUserByEmail,
  getUserById,
  sanitizeStoredUser,
  type CreateUserInput,
} from "@/lib/user/user-store";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<CreateUserInput>;
  const email = payload?.email?.trim();
  const password = payload?.password?.trim();
  const name = payload?.name?.trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Потрібні електронна пошта та пароль." },
      { status: 400 }
    );
  }

  const existingUser = findUserByEmail(email);

  if (existingUser) {
    return NextResponse.json(
      { error: "Користувач з такою поштою вже існує." },
      { status: 409 }
    );
  }

  const user = createUser({
    email,
    password,
    name,
  });

  const cookieStore = await Promise.resolve(cookies());
  cookieStore.set({
    name: "auth_token",
    value: user.id,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ user: sanitizeStoredUser(user) }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieStore = await Promise.resolve(cookies());
  const requestedId = searchParams.get("id") ?? cookieStore.get("auth_token")?.value;

  if (!requestedId) {
    return NextResponse.json(
      { error: "Не вказано ідентифікатор користувача." },
      { status: 400 }
    );
  }

  const user = getUserById(requestedId);

  if (!user) {
    return NextResponse.json(
      { error: "Користувача не знайдено." },
      { status: 404 }
    );
  }

  return NextResponse.json({ user: sanitizeStoredUser(user) }, { status: 200 });
}
