"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { currencyFormatter, getParcelaInfo, resolveMonthExpenses, totalAmount } from "@/lib/finance";
import { useFinance } from "@/lib/store";
import { Expense, FundingSource, Recurrence } from "@/lib/types";

const NEW_CATEGORY_OPTION = "__nova__";

function normalizeCategoryKey(value: string): string {
  return value.trim().toLowerCase();
}

export default function DespesasPage() {
  const { state, addExpense, updateExpense, deleteExpense, sessionUserId, isLoading } =
    useFinance();
  const currentUser = state.users.find((user) => user.id === sessionUserId) ?? null;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [recorrencia, setRecorrencia] = useState<Recurrence>("mensal");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [fonte, setFonte] = useState<FundingSource>("saldo_mensal");
  const [dataReferencia, setDataReferencia] = useState(`${state.selectedMonth}-01`);
  const [filtroUsuario, setFiltroUsuario] = useState<string>("todos");

  const monthExpenses = resolveMonthExpenses(state.expenses, state.selectedMonth);

  // Categorias existentes, deduplicadas sem diferenciar maiusculas/minusculas.
  const existingCategories = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const expense of state.expenses) {
      const label = expense.categoria.trim() || "Geral";
      const key = normalizeCategoryKey(label);
      if (!byKey.has(key)) byKey.set(key, label);
    }
    if (!byKey.has("geral")) byKey.set("geral", "Geral");
    return Array.from(byKey.values()).sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
    );
  }, [state.expenses]);

  function resolveCategory(raw: string): string {
    const cleaned = raw.trim() || "Geral";
    const key = normalizeCategoryKey(cleaned);
    const existing = existingCategories.find(
      (category) => normalizeCategoryKey(category) === key,
    );
    return existing ?? cleaned;
  }

  const filteredExpenses =
    filtroUsuario === "todos"
      ? monthExpenses
      : monthExpenses.filter((expense) => expense.responsibleUserId === filtroUsuario);

  const categoryBlocks = useMemo(() => {
    const blocks = new Map<string, { label: string; expenses: Expense[] }>();
    for (const expense of filteredExpenses) {
      const label = expense.categoria.trim() || "Geral";
      const key = normalizeCategoryKey(label);
      const block = blocks.get(key);
      if (block) {
        block.expenses.push(expense);
      } else {
        blocks.set(key, { label, expenses: [expense] });
      }
    }
    return Array.from(blocks.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
    );
  }, [filteredExpenses]);

  const filteredTotal = totalAmount(filteredExpenses);

  function resetForm() {
    setEditingId(null);
    setTitulo("");
    setValor("");
    setCategoria("Geral");
    setNovaCategoria("");
    setCriandoCategoria(false);
    setRecorrencia("mensal");
    setQuantidadeParcelas("");
    setDataReferencia(`${state.selectedMonth}-01`);
    setFonte("saldo_mensal");
  }

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
      categoria: resolveCategory(criandoCategoria ? novaCategoria : categoria),
      dataReferencia,
      fonte,
    };

    if (editingId) {
      updateExpense(editingId, payload);
    } else {
      addExpense(payload);
    }

    resetForm();
  }

  function handleEdit(id: string) {
    const expense = state.expenses.find((item) => item.id === id);
    if (!expense || expense.responsibleUserId !== sessionUserId) return;

    setEditingId(expense.id);
    setTitulo(expense.titulo);
    setValor(String(expense.valor));
    setCategoria(resolveCategory(expense.categoria));
    setNovaCategoria("");
    setCriandoCategoria(false);
    setRecorrencia(expense.recorrencia);
    setQuantidadeParcelas(
      expense.quantidadeParcelas && expense.quantidadeParcelas > 0
        ? String(expense.quantidadeParcelas)
        : "",
    );
    setDataReferencia(expense.dataReferencia);
    setFonte(expense.fonte);
  }

  function renderExpense(expense: Expense) {
    const user = state.users.find((item) => item.id === expense.responsibleUserId);
    return (
      <article className="rounded-lg border border-border bg-panel p-3" key={expense.id}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-medium">{expense.titulo}</h4>
            <p className="text-sm text-muted">
              {user?.nome} | {expense.fonte}
            </p>
            {getParcelaInfo(expense, state.selectedMonth) ? (
              <p className="mt-1 text-xs text-accent">
                {getParcelaInfo(expense, state.selectedMonth)}
              </p>
            ) : null}
          </div>
          <strong className="shrink-0 text-expense">
            {currencyFormatter.format(expense.valor)}
          </strong>
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

            <div className="block text-sm text-muted">
              Categoria
              {criandoCategoria ? (
                <div className="mt-1 flex gap-2">
                  <input
                    autoFocus
                    className="w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                    onChange={(event) => setNovaCategoria(event.target.value)}
                    placeholder="Nome da nova categoria"
                    value={novaCategoria}
                  />
                  <button
                    className="shrink-0 rounded-md border border-border bg-panelAlt px-3 py-2 text-xs text-muted transition hover:text-text"
                    onClick={() => {
                      setCriandoCategoria(false);
                      setNovaCategoria("");
                    }}
                    type="button"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <select
                  className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                  onChange={(event) => {
                    if (event.target.value === NEW_CATEGORY_OPTION) {
                      setCriandoCategoria(true);
                    } else {
                      setCategoria(event.target.value);
                    }
                  }}
                  value={categoria}
                >
                  {existingCategories.map((category) => (
                    <option key={normalizeCategoryKey(category)} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY_OPTION}>+ Nova categoria...</option>
                </select>
              )}
              {criandoCategoria &&
              novaCategoria.trim() &&
              existingCategories.some(
                (category) =>
                  normalizeCategoryKey(category) === normalizeCategoryKey(novaCategoria),
              ) ? (
                <p className="mt-1 text-xs text-accent">
                  Essa categoria ja existe, o lancamento entrara em{" "}
                  <strong>{resolveCategory(novaCategoria)}</strong>.
                </p>
              ) : null}
            </div>

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
                onClick={resetForm}
                type="button"
              >
                Cancelar edicao
              </button>
            ) : null}
          </form>
        </Card>

        <Card subtitle={`Ativas para ${state.selectedMonth}`} title="Despesas do Mes">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Responsavel:</span>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              <button
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                  filtroUsuario === "todos"
                    ? "border-brand/40 bg-brand/20 text-brand"
                    : "border-border bg-panelAlt text-muted hover:text-text"
                }`}
                onClick={() => setFiltroUsuario("todos")}
                type="button"
              >
                Todos
              </button>
              {state.users.map((user) => (
                <button
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                    filtroUsuario === user.id
                      ? "border-brand/40 bg-brand/20 text-brand"
                      : "border-border bg-panelAlt text-muted hover:text-text"
                  }`}
                  key={user.id}
                  onClick={() => setFiltroUsuario(user.id)}
                  type="button"
                >
                  {user.nome}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm text-muted">
              Total: <strong className="text-expense">{currencyFormatter.format(filteredTotal)}</strong>
            </span>
          </div>

          <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-260px)]">
            {categoryBlocks.length === 0 ? (
              <p className="text-sm text-muted">
                Nenhuma despesa encontrada para este mes com o filtro atual.
              </p>
            ) : (
              categoryBlocks.map((block) => (
                <section
                  className="rounded-xl border border-border bg-panelAlt p-3"
                  key={normalizeCategoryKey(block.label)}
                >
                  <header className="sticky -top-px z-10 -mx-3 -mt-3 mb-3 flex items-center justify-between gap-3 rounded-t-xl border-b border-border bg-panelAlt px-3 py-2">
                    <h3 className="font-semibold">{block.label}</h3>
                    <p className="text-sm text-muted">
                      {block.expenses.length}{" "}
                      {block.expenses.length === 1 ? "lancamento" : "lancamentos"} |{" "}
                      <strong className="text-expense">
                        {currencyFormatter.format(totalAmount(block.expenses))}
                      </strong>
                    </p>
                  </header>
                  <div className="space-y-2">{block.expenses.map(renderExpense)}</div>
                </section>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
