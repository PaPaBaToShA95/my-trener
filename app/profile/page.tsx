"use client";

import { useState } from "react";
import { Loader2, RefreshCcw, Save, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMobileAuth } from "@/components/auth/mobile-auth-gate";
import { useUser } from "@/lib/user/user-context";
import { hashPin, isValidPin } from "@/lib/auth/hash";
import { updateMobileUser } from "@/lib/repos/mobile-users";

export default function ProfilePage() {
  const { user, deviceId, refresh, logout } = useMobileAuth();
  const { setProfile } = useUser();
  const [name, setName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email ?? "");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState(false);

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      setStatus(null);
      await updateMobileUser(deviceId, {
        displayName: name.trim(),
        email: email.trim() || undefined,
      });
      await refresh();
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: name.trim(),
              email: email.trim(),
            }
          : prev,
      );
      setStatus("Профіль оновлено");
    } catch (error) {
      console.error("Failed to update profile", error);
      setStatus("Не вдалося зберегти зміни. Перевірте підключення до Firebase.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePinSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidPin(pin)) {
      setStatus("PIN має складатися з 4-6 цифр.");
      return;
    }

    if (pin !== pinConfirm) {
      setStatus("PIN-коди не збігаються.");
      return;
    }

    try {
      setIsSavingPin(true);
      setStatus(null);
      const pinHash = await hashPin(pin, deviceId);
      await updateMobileUser(deviceId, { pinHash });
      await refresh();
      setPin("");
      setPinConfirm("");
      setStatus("PIN успішно оновлено.");
    } catch (error) {
      console.error("Failed to update pin", error);
      setStatus("Не вдалося оновити PIN. Перевірте підключення до Firebase.");
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">Мій профіль</h1>
        <p className="text-sm text-muted-foreground">
          Оновлюй контактні дані, керуй PIN-доступом та відʼєднуй пристрій.
        </p>
      </header>

      <div className="rounded-3xl border border-border/60 bg-card/70 p-4 shadow-lg">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Ідентифікатор пристрою</p>
        <p className="mt-1 font-mono text-sm text-foreground">{deviceId}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-border/50 px-3"
          onClick={() => void refresh()}
        >
          <RefreshCcw className="h-4 w-4" /> Оновити дані
        </Button>
      </div>

      <form
        onSubmit={handleProfileSave}
        className="space-y-4 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-inner"
      >
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Імʼя</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} required disabled={isSavingProfile} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Електронна пошта</label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={isSavingProfile}
          />
        </div>
        <Button
          type="submit"
          className="w-full rounded-2xl bg-primary/80 text-primary-foreground hover:bg-primary"
          disabled={isSavingProfile}
        >
          {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Зберегти профіль
        </Button>
      </form>

      <form
        onSubmit={handlePinSave}
        className="space-y-4 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-inner"
      >
        <div className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-5 w-5 text-secondary" />
          <span className="text-sm">Зміна PIN-доступу</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Новий PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              pattern="\\d*"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="4-6 цифр"
              disabled={isSavingPin}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Підтвердіть PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              pattern="\\d*"
              value={pinConfirm}
              onChange={(event) => setPinConfirm(event.target.value)}
              placeholder="повторіть"
              disabled={isSavingPin}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full rounded-2xl border border-secondary/50 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30"
          disabled={isSavingPin}
        >
          {isSavingPin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Оновити PIN
        </Button>
      </form>

      {status ? (
        <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-2 text-sm text-muted-foreground">{status}</div>
      ) : null}

      <Button
        variant="ghost"
        className="w-full rounded-2xl border border-destructive/50 bg-destructive/20 text-destructive-foreground hover:bg-destructive/30"
        onClick={logout}
      >
        Вийти з акаунта
      </Button>
    </section>
  );
}
