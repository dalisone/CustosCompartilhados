"use client";

import { FormEvent, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { currencyFormatter, getParcelaInfo, resolveMonthExpenses } from "@/lib/finance";
import { useFinance } from "@/lib/store";
import { FundingSource, Recurrence } from "@/lib/types";

export default function DespesasPage() {
  const { state, addExpense, updateExpense, deleteExpense, sessionUserId, isLoading } =
    useFinance();
  const currentUser = state.users.find((user) => user.id === sessionUserId) ?? null;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [recorrencia, setRecorrencia] = useState<Recurrence>("mensal");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [fonte, setFonte] = useState<FundingSource>("saldo_mensal");
  const [dataReferencia, setDataReferencia] = useState(`${state.selectedMonth}-01`);

  const monthExpenses = resolveMonthExpenses(state.expenses, state.selectedMonth);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionUserId || isLoading) return;
    const parsedValue = Number(valor.replace(",", "."));
    if (!titulo.trim() || Number.isNaN(parsedValue) || parsedValue <= 0) return;

    const parsedParcelas =
      recorrencia === "mensal" && quantidadeParcelas.trim()
        ? Number(quantidadeParcelas)
        : null;
    const payload = {
      responsibleUserId: sessionUserId,
      titulo: titulo.trim(),
      valor: parsedValue,
      recorrencia,
      quantidadeParcelas:
        parsedParcelas && !Number.isNaN(parsedParcelas) && parsedParcelas > 0
          ? parsedParcelas
          : null,
      categoria: categoria.trim() || "Geral",
      dataReferencia,
      fonte,
    };

    if (editingId) {
      updateExpense(editingId, payload);
    } else {
      addExpense(payload);
    }

    setEditingId(null);
    setTitulo("");
    setValor("");
    setCategoria("Geral");
    setRecorrencia("mensal");
    setQuantidadeParcelas("");
    setDataReferencia(`${state.selectedMonth}-01`);
    setFonte("saldo_mensal");
  }

  function handleEdit(id: string) {
    const expense = state.expenses.find((item) => item.id === id);
    if (!expense || expense.responsibleUserId !== sessionUserId) return;

    setEditingId(expense.id);
    setTitulo(expense.titulo);
    setValor(String(expense.valor));
    setCategoria(expense.categoria);
    setRecorrencia(expense.recorrencia);
    setQuantidadeParcelas(
      expense.quantidadeParcelas && expense.quantidadeParcelas > 0
        ? String(expense.quantidadeParcelas)
        : "",
    );
    setDataReferencia(expense.dataReferencia);
    setFonte(expense.fonte);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitulo("");
    setValor("");
    setCategoria("Geral");
    setRecorrencia("mensal");
    setQuantidadeParcelas("");
    setDataReferencia(`${state.selectedMonth}-01`);
    setFonte("saldo_mensal");
  }

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card
          subtitle="Defina responsavel, categoria, origem e periodicidade"
          title={editingId ? "Editar Despesa" : "Nova Despesa"}
        >
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm text-muted">
              Titulo
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ex.: Aluguel, Mercado, Internet"
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

            <label className="block text-sm text-muted">
              Categoria
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setCategoria(event.target.value)}
                value={categoria}
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
                  onChange={(event) => setDataReferencia(event.target.value)}
                  type="date"
                  value={dataReferencia}
                />
              </label>
            </div>

            {recorrencia === "mensal" ? (
              <label className="block text-sm text-muted">
                Quantidade de parcelas (opcional)
                <input
                  className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                  min={1}
                  onChange={(event) => setQuantidadeParcelas(event.target.value)}
                  placeholder="Ex.: 12 (deixe vazio para recorrencia sem fim)"
                  type="number"
                  value={quantidadeParcelas}
                />
              </label>
            ) : null}

            <label className="block text-sm text-muted">
              Fonte
              <select
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setFonte(event.target.value as FundingSource)}
                value={fonte}
              >
                <option value="saldo_mensal">Saldo mensal</option>
                <option value="guardado">Guardado</option>
                <option value="misto">Misto</option>
              </select>
            </label>

            <button
              className="w-full rounded-md border border-expense/50 bg-expense/20 px-3 py-2 font-semibold text-expense transition hover:bg-expense/30"
              type="submit"
            >
              {editingId ? "Salvar alteracoes" : "Salvar despesa"}
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

        <Card subtitle={`Ativas para ${state.selectedMonth}`} title="Despesas do Mes">
          <div className="space-y-2">
            {monthExpenses.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma despesa cadastrada para este mes.</p>
            ) : (
              monthExpenses.map((expense) => {
                const user = state.users.find((item) => item.id === expense.responsibleUserId);
                return (
                  <article className="rounded-lg border border-border bg-panelAlt p-3" key={expense.id}>
                    <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{expense.titulo}</h3>
                      <p className="text-sm text-muted">
                        {expense.categoria} | {user?.nome} | {expense.fonte}
                      </p>
                      {getParcelaInfo(expense, state.selectedMonth) ? (
                        <p className="mt-1 text-xs text-accent">
                          {getParcelaInfo(expense, state.selectedMonth)}
                        </p>
                      ) : null}
                    </div>
                    <strong className="text-expense">{currencyFormatter.format(expense.valor)}</strong>
                    </div>
                    {expense.responsibleUserId === sessionUserId ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-text"
                          onClick={() => handleEdit(expense.id)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="rounded-md border border-expense/40 bg-expense/10 px-3 py-1.5 text-xs text-expense transition hover:bg-expense/20"
                          onClick={() => {
                            if (window.confirm("Deseja remover esta despesa?")) {
                              deleteExpense(expense.id);
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
