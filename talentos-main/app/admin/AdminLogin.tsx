"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminLogin({ setupMissing = false }: { setupMissing?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (setupMissing) return;

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setError(json?.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Admin protegido</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {setupMissing
              ? "Faltan ADMIN_USER y ADMIN_PASSWORD en las variables de entorno."
              : "Introduce usuario y contraseña para acceder a /admin."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Usuario</label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={setupMissing || loading}
              className={cx(
                "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm",
                "text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={setupMissing || loading}
              className={cx(
                "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm",
                "text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              )}
            />
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={setupMissing || loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
