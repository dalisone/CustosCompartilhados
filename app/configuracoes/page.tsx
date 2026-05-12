"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { useFinance } from "@/lib/store";

export default function ConfiguracoesPage() {
  const { state, sessionUserId, updateCurrentUserName, refreshData } = useFinance();

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === sessionUserId) ?? null,
    [state.users, sessionUserId],
  );
  const [nome, setNome] = useState(currentUser?.nome ?? "");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setNome(currentUser?.nome ?? "");
  }, [currentUser?.nome]);

  function syncInputFromCurrent() {
    setNome(currentUser?.nome ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateCurrentUserName(nome);
    setFeedback("Nome atualizado com sucesso.");
  }

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card subtitle="Altere apenas seu proprio nome de exibicao" title="Meu Perfil">
          <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
            <label className="block text-sm text-muted">
              Nome
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setNome(event.target.value)}
                value={nome}
              />
            </label>

            <button
              className="w-full rounded-md border border-brand/40 bg-brand/20 px-3 py-2 font-semibold text-brand transition hover:bg-brand/30"
              type="submit"
            >
              Salvar meu nome
            </button>
            <button
              className="w-full rounded-md border border-border bg-panelAlt px-3 py-2 text-sm text-muted transition hover:text-text"
              onClick={syncInputFromCurrent}
              type="button"
            >
              Recarregar nome atual
            </button>
            {feedback ? <p className="text-sm text-brand">{feedback}</p> : null}
          </form>
        </Card>

        <Card subtitle="Ferramentas de sincronizacao com o banco compartilhado" title="Sistema">
          <div className="space-y-3 text-sm text-muted">
            <p>
              O app esta conectado ao Supabase e sincroniza os dados por perfil autenticado.
            </p>
            <p>
              Se voce estiver em mais de um dispositivo, pode recarregar manualmente os dados
              para refletir alteracoes recentes.
            </p>
            <button
              className="rounded-md border border-border bg-panelAlt px-3 py-2 font-semibold text-muted transition hover:text-text"
              onClick={() => void refreshData()}
              type="button"
            >
              Sincronizar agora
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
