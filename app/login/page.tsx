"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await signIn(email, senha);

    if (!result.userId) {
      setErro(result.error ?? "Falha de autenticacao.");
      return;
    }

    router.replace("/dashboard");
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
              className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2 text-text"
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
              className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2 text-text"
              onChange={(event) => setSenha(event.target.value)}
              required
              type="password"
              value={senha}
            />
          </label>

          {erro ? <p className="text-sm text-expense">{erro}</p> : null}

          <button
            className="w-full rounded-md border border-brand/40 bg-brand/20 px-3 py-2 font-semibold text-brand transition hover:bg-brand/30"
            type="submit"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 rounded-md border border-border bg-panelAlt p-3 text-xs text-muted">
          Use os usuarios cadastrados no Supabase Auth.
        </div>
      </section>
    </main>
  );
}
