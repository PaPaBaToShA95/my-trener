"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Loader2, LockKeyhole, UserPlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrCreateDeviceId } from "@/lib/auth/device";
import { hashPin, isValidPin } from "@/lib/auth/hash";
import {
  createMobileUser,
  getMobileUser,
  updateMobileUser,
} from "@/lib/repos/mobile-users";
import { useUser, type UserProfile as UserContextProfile } from "@/lib/user/user-context";
import type { MobileUserProfile } from "@/types/mobile-app";

const TOKEN_KEY = "my-trener-auth-token";

type AuthMode = "loading" | "register" | "login" | "authenticated";

type MobileAuthContextValue = {
  deviceId: string;
  user: MobileUserProfile;
  logout: () => void;
  refresh: () => Promise<void>;
};

const MobileAuthContext = createContext<MobileAuthContextValue | null>(null);

function toUserContextProfile(user: MobileUserProfile): UserContextProfile {
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.displayName,
  };
}

export function useMobileAuth(): MobileAuthContextValue {
  const context = useContext(MobileAuthContext);

  if (!context) {
    throw new Error("useMobileAuth must be used within MobileAuthGate");
  }

  return context;
}

interface MobileAuthGateProps {
  children: ReactNode;
}

export function MobileAuthGate({ children }: MobileAuthGateProps) {
  const { setProfile } = useUser();
  const [mode, setMode] = useState<AuthMode>("loading");
  const [deviceId, setDeviceId] = useState<string>("");
  const [user, setUser] = useState<MobileUserProfile | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const [loginPin, setLoginPin] = useState("");

  const bootstrap = useCallback(async () => {
    try {
      setMode("loading");
      setError(null);
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      const existingUser = await getMobileUser(id);

      if (existingUser) {
        setUser(existingUser);
        setName(existingUser.displayName);
        setEmail(existingUser.email ?? "");

        const storedToken =
          typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

        if (storedToken && storedToken === existingUser.pinHash) {
          setProfile(toUserContextProfile(existingUser));
          setMode("authenticated");
          await updateMobileUser(id, { lastLoginAt: new Date().toISOString() });
        } else {
          setMode("login");
        }
      } else {
        setMode("register");
      }
    } catch (bootstrapError) {
      console.error("Failed to initialise authentication", bootstrapError);
      setError(
        "Не вдалося зʼєднатися з Firebase. Перевірте токени доступу та спробуйте ще раз.",
      );
      setMode("register");
    }
  }, [setProfile]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const handleRegister = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!deviceId) {
        return;
      }

      if (!name.trim()) {
        setError("Будь ласка, вкажіть імʼя.");
        return;
      }

      if (!isValidPin(pin)) {
        setError("PIN має складатися з 4-6 цифр.");
        return;
      }

      if (pin !== pinConfirm) {
        setError("PIN-коди не збігаються.");
        return;
      }

      try {
        setIsBusy(true);
        setError(null);
        const pinHash = await hashPin(pin, deviceId);
        const created = await createMobileUser({
          deviceId,
          displayName: name.trim(),
          email: email.trim() || undefined,
          pinHash,
        });

        setUser(created);
        setProfile(toUserContextProfile(created));
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, created.pinHash);
        }
        setPin("");
        setPinConfirm("");
        setMode("authenticated");
      } catch (registerError) {
        console.error("Failed to create profile", registerError);
        setError("Не вдалося зберегти профіль. Перевірте підключення та спробуйте ще раз.");
      } finally {
        setIsBusy(false);
      }
    },
    [deviceId, email, name, pin, pinConfirm, setProfile],
  );

  const handleLogin = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!deviceId || !user) {
        return;
      }

      if (!isValidPin(loginPin)) {
        setError("Введіть коректний PIN (4-6 цифр).");
        return;
      }

      try {
        setIsBusy(true);
        setError(null);
        const pinHash = await hashPin(loginPin, deviceId);

        if (pinHash !== user.pinHash) {
          setError("Невірний PIN. Спробуйте ще раз.");
          return;
        }

        const now = new Date().toISOString();
        await updateMobileUser(deviceId, { lastLoginAt: now });
        setProfile(toUserContextProfile({ ...user, lastLoginAt: now }));
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, pinHash);
        }
        setLoginPin("");
        setMode("authenticated");
      } catch (loginError) {
        console.error("Failed to login", loginError);
        setError("Не вдалося увійти. Перевірте підключення та спробуйте знову.");
      } finally {
        setIsBusy(false);
      }
    },
    [deviceId, loginPin, setProfile, user],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }

    setProfile(null);
    setMode(user ? "login" : "register");
    setLoginPin("");
    setError(null);
  }, [setProfile, user]);

  const refresh = useCallback(async () => {
    if (!deviceId) {
      return;
    }

    const refreshed = await getMobileUser(deviceId);
    if (!refreshed) {
      return;
    }

    setUser(refreshed);
    setProfile(toUserContextProfile(refreshed));
  }, [deviceId, setProfile]);

  const contextValue = useMemo<MobileAuthContextValue | null>(() => {
    if (mode !== "authenticated" || !user || !deviceId) {
      return null;
    }

    return {
      deviceId,
      user,
      logout,
      refresh,
    };
  }, [deviceId, logout, mode, refresh, user]);

  if (mode === "authenticated" && contextValue) {
    return (
      <MobileAuthContext.Provider value={contextValue}>
        {children}
      </MobileAuthContext.Provider>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-border/50 bg-card/80 p-6 text-foreground shadow-lg backdrop-blur">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
            {mode === "register" ? <UserPlus2 className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">My Trener</p>
            <h1 className="mt-2 text-xl font-semibold text-foreground">
              {mode === "register" ? "Створіть свій мобільний профіль" : "Введіть PIN"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "register"
                ? "Щоб розпочати, додайте коротку інформацію та задайте PIN для захисту даних."
                : user
                  ? `Ласкаво просимо назад, ${user.displayName}!`
                  : "Для доступу введіть свій PIN."}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {mode === "loading" ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : mode === "register" ? (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Ваше імʼя
                </label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Наприклад, Андрій"
                  disabled={isBusy}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Електронна пошта (необовʼязково)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={isBusy}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    PIN
                  </label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="\\d*"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    placeholder="4-6 цифр"
                    disabled={isBusy}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Підтвердіть PIN
                  </label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="\\d*"
                    value={pinConfirm}
                    onChange={(event) => setPinConfirm(event.target.value)}
                    placeholder="повторіть"
                    disabled={isBusy}
                    required
                  />
                </div>
              </div>
              {error ? (
                <p className="rounded-xl border border-secondary/50 bg-secondary/10 px-3 py-2 text-sm text-secondary-foreground">
                  {error}
                </p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
                {isBusy ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Створюємо профіль
                  </span>
                ) : (
                  "Розпочати"
                )}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  PIN-доступ
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={loginPin}
                  onChange={(event) => setLoginPin(event.target.value)}
                  placeholder="Введіть ваш PIN"
                  disabled={isBusy}
                  required
                  autoFocus
                />
              </div>
              {error ? (
                <p className="rounded-xl border border-secondary/50 bg-secondary/10 px-3 py-2 text-sm text-secondary-foreground">
                  {error}
                </p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
                {isBusy ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Перевіряємо PIN
                  </span>
                ) : (
                  "Увійти"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Пристрій: <span className="font-mono text-foreground">{deviceId}</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
