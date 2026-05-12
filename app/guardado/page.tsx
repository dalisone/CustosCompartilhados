"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { currencyFormatter, savingsBalance } from "@/lib/finance";
import { useFinance } from "@/lib/store";
import { SavingsType } from "@/lib/types";

export default function GuardadoPage() {
  const { state, addSavings, updateSavings, deleteSavings, sessionUserId, isLoading } =
    useFinance();
  const currentUser = state.users.find((user) => user.id === sessionUserId) ?? null;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<SavingsType>("deposito");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  const saldo = useMemo(
    () => savingsBalance(state.savingsTransactions),
    [state.savingsTransactions],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionUserId || isLoading) return;
    const parsedValue = Number(valor.replace(",", "."));
    if (!descricao.trim() || Number.isNaN(parsedValue) || parsedValue <= 0) return;

    const payload = {
      userId: sessionUserId,
      tipo,
      valor: parsedValue,
      descricao: descricao.trim(),
    };

    if (editingId) {
      updateSavings(editingId, payload);
    } else {
      addSavings(payload);
    }

    setEditingId(null);
    setValor("");
    setDescricao("");
    setTipo("deposito");
  }

  function handleEdit(id: string) {
    const tx = state.savingsTransactions.find((item) => item.id === id);
    if (!tx || tx.userId !== sessionUserId) return;

    setEditingId(tx.id);
    setTipo(tx.tipo);
    setValor(String(tx.valor));
    setDescricao(tx.descricao);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTipo("deposito");
    setValor("");
    setDescricao("");
  }

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card
          subtitle="Depositos e resgates da reserva do casal"
          title={editingId ? "Editar Movimentacao" : "Movimentar Guardado"}
        >
          <form className="space-y-3" onSubmit={handleSubmit}>
            <p className="rounded-md border border-border bg-panelAlt px-3 py-2 text-sm text-muted">
              Movimentacao registrada para:{" "}
              <strong className="text-text">{currentUser?.nome ?? "Carregando perfil..."}</strong>
            </p>
            <label className="block text-sm text-muted">
              Tipo
              <select
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setTipo(event.target.value as SavingsType)}
                value={tipo}
              >
                <option value="deposito">Deposito</option>
                <option value="resgate">Resgate</option>
              </select>
            </label>

            <label className="block text-sm text-muted">
              Valor
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                min={0}
                onChange={(event) => setValor(event.target.value)}
                placeholder="0,00"
                required
                step="0.01"
                type="number"
                value={valor}
              />
            </label>

            <label className="block text-sm text-muted">
              Descricao
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Ex.: aporte mensal, compra de emergencia"
                required
                value={descricao}
              />
            </label>

            <button
              className="w-full rounded-md border border-accent/50 bg-accent/15 px-3 py-2 font-semibold text-accent transition hover:bg-accent/25"
              type="submit"
            >
              {editingId ? "Salvar alteracoes" : "Registrar movimentacao"}
            </button>
            {editingId ? (
              <button
                className="w-full rounded-md border border-border bg-panelAlt px-3 py-2 text-sm text-muted transition hover:text-text"
                onClick={handleCancelEdit}
                type="button"
              >
                Cancelar edicao
              </button>
            ) : null}
          </form>
        </Card>

        <Card subtitle="Saldo acumulado da reserva" title="Historico e Saldo">
          <p className={`mb-4 text-3xl font-semibold ${saldo >= 0 ? "text-brand" : "text-expense"}`}>
            {currencyFormatter.format(saldo)}
          </p>

          <div className="space-y-2">
            {state.savingsTransactions.map((tx) => (
              <article className="rounded-lg border border-border bg-panelAlt p-3" key={tx.id}>
                <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">{tx.descricao}</h3>
                  <p className="text-sm text-muted">
                    {state.users.find((user) => user.id === tx.userId)?.nome ?? "Usuario"} |{" "}
                    {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <strong className={tx.tipo === "deposito" ? "text-brand" : "text-expense"}>
                  {tx.tipo === "deposito" ? "+" : "-"} {currencyFormatter.format(tx.valor)}
                </strong>
                </div>
                {tx.userId === sessionUserId ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-text"
                      onClick={() => handleEdit(tx.id)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-md border border-expense/40 bg-expense/10 px-3 py-1.5 text-xs text-expense transition hover:bg-expense/20"
                      onClick={() => {
                        if (window.confirm("Deseja remover esta movimentacao do guardado?")) {
                          deleteSavings(tx.id);
                        }
                      }}
                      type="button"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted">
                    Somente o perfil dono pode editar esta movimentacao.
                  </p>
                )}
              </article>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
