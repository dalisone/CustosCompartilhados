"use client";

import { FormEvent, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { currencyFormatter, resolveMonthIncomes } from "@/lib/finance";
import { useFinance } from "@/lib/store";
import { Recurrence } from "@/lib/types";

export default function RendasPage() {
  const { state, addIncome, updateIncome, deleteIncome, sessionUserId, isLoading } =
    useFinance();
  const currentUser = state.users.find((user) => user.id === sessionUserId) ?? null;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [recorrencia, setRecorrencia] = useState<Recurrence>("mensal");
  const [dataInicio, setDataInicio] = useState(`${state.selectedMonth}-01`);

  const monthIncomes = resolveMonthIncomes(state.incomes, state.selectedMonth);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionUserId || isLoading) return;
    const parsedValue = Number(valor.replace(",", "."));
    if (!titulo.trim() || Number.isNaN(parsedValue) || parsedValue <= 0) return;

    const payload = {
      userId: sessionUserId,
      titulo: titulo.trim(),
      valor: parsedValue,
      recorrencia,
      dataInicio,
    };

    if (editingId) {
      updateIncome(editingId, payload);
    } else {
      addIncome(payload);
    }

    setEditingId(null);
    setTitulo("");
    setValor("");
    setRecorrencia("mensal");
    setDataInicio(`${state.selectedMonth}-01`);
  }

  function handleEdit(id: string) {
    const income = state.incomes.find((item) => item.id === id);
    if (!income || income.userId !== sessionUserId) return;

    setEditingId(income.id);
    setTitulo(income.titulo);
    setValor(String(income.valor));
    setRecorrencia(income.recorrencia);
    setDataInicio(income.dataInicio);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitulo("");
    setValor("");
    setRecorrencia("mensal");
    setDataInicio(`${state.selectedMonth}-01`);
  }

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card
          subtitle="Registre renda mensal ou renda unica"
          title={editingId ? "Editar Renda" : "Nova Renda"}
        >
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm text-muted">
              Titulo
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ex.: Salario, Bonus, Freelance"
                required
                value={titulo}
              />
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

            <p className="rounded-md border border-border bg-panelAlt px-3 py-2 text-sm text-muted">
              Lancamento sera registrado para:{" "}
              <strong className="text-text">{currentUser?.nome ?? "Carregando perfil..."}</strong>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-muted">
                Recorrencia
                <select
                  className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                  onChange={(event) => setRecorrencia(event.target.value as Recurrence)}
                  value={recorrencia}
                >
                  <option value="mensal">Mensal</option>
                  <option value="unica">Unica</option>
                </select>
              </label>
              <label className="block text-sm text-muted">
                Data base
                <input
                  className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                  onChange={(event) => setDataInicio(event.target.value)}
                  type="date"
                  value={dataInicio}
                />
              </label>
            </div>

            <button
              className="w-full rounded-md border border-brand/40 bg-brand/20 px-3 py-2 font-semibold text-brand transition hover:bg-brand/30"
              type="submit"
            >
              {editingId ? "Salvar alteracoes" : "Salvar renda"}
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

        <Card subtitle={`Ativas para ${state.selectedMonth}`} title="Rendas do Mes">
          <div className="space-y-2">
            {monthIncomes.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma renda cadastrada para este mes.</p>
            ) : (
              monthIncomes.map((income) => {
                const user = state.users.find((item) => item.id === income.userId);
                return (
                  <article className="rounded-lg border border-border bg-panelAlt p-3" key={income.id}>
                    <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{income.titulo}</h3>
                      <p className="text-sm text-muted">
                        {user?.nome} | {income.recorrencia}
                      </p>
                    </div>
                    <strong className="text-income">{currencyFormatter.format(income.valor)}</strong>
                    </div>
                    {income.userId === sessionUserId ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-text"
                          onClick={() => handleEdit(income.id)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="rounded-md border border-expense/40 bg-expense/10 px-3 py-1.5 text-xs text-expense transition hover:bg-expense/20"
                          onClick={() => {
                            if (window.confirm("Deseja remover esta renda?")) {
                              deleteIncome(income.id);
                            }
                          }}
                          type="button"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted">
                        Somente {user?.nome} pode editar este lancamento.
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
