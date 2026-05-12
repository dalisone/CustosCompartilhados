"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUserIdClient, signIn } from "@/lib/session";
import { useFinance } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { isLoading, sessionUserId } = useFinance();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (sessionUserId) router.replace("/dashboard");
  }, [router, sessionUserId, isLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const formEmail = String(formData.get("email") ?? "").trim();
    const formSenha = String(formData.get("senha") ?? "");

    const result = await signIn(formEmail, formSenha);

    if (!result.userId) {
      setErro(result.error ?? "Falha de autenticacao.");
      setIsSubmitting(false);
      return;
    }

    for (let i = 0; i < 8; i += 1) {
      const sessionId = await getSessionUserIdClient();
      if (sessionId) {
        window.location.assign("/dashboard");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    window.location.assign("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <section className="w-full max-w-md rounded-xl2 border border-border bg-panel p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-muted">Acesse seu perfil para registrar seus lancamentos.</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm text-muted">
            Email
            <input
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2 text-text"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@exemplo.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block text-sm text-muted">
            Senha
            <input
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2 text-text"
              name="senha"
              onChange={(event) => setSenha(event.target.value)}
              required
              type="password"
              value={senha}
            />
          </label>

          {erro ? <p className="text-sm text-expense">{erro}</p> : null}

          <button
            className="w-full rounded-md border border-brand/40 bg-brand/20 px-3 py-2 font-semibold text-brand transition hover:bg-brand/30"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 rounded-md border border-border bg-panelAlt p-3 text-xs text-muted">
          Use os usuarios cadastrados no Supabase Auth.
        </div>
      </section>
    </main>
  );
}
