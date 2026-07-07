"use client";

import { FormEvent, useState } from "react";
import { AppShell, Card } from "@/components/app-shell";
import { buildEnvelopeSummary, currencyFormatter, toMonth } from "@/lib/finance";
import { useFinance } from "@/lib/store";
import { Envelope, EnvelopeTransactionType } from "@/lib/types";

function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const movementLabels: Record<EnvelopeTransactionType, string> = {
  gasto: "Gasto",
  deposito: "Deposito",
  resgate: "Resgate",
};

export default function CaixinhasPage() {
  const {
    state,
    sessionUserId,
    isLoading,
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    addEnvelopeTransaction,
    deleteEnvelopeTransaction,
  } = useFinance();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [expenseId, setExpenseId] = useState("");
  const [metaValor, setMetaValor] = useState("");
  const [dataInicio, setDataInicio] = useState(`${state.selectedMonth}-01`);

  const [movement, setMovement] = useState<{
    envelopeId: string;
    tipo: EnvelopeTransactionType;
  } | null>(null);
  const [movValor, setMovValor] = useState("");
  const [movDescricao, setMovDescricao] = useState("");
  const [movData, setMovData] = useState(todayISO());

  const month = state.selectedMonth;
  const myExpenses = state.expenses.filter(
    (expense) => expense.responsibleUserId === sessionUserId && expense.ativo,
  );

  const sortedEnvelopes = [...state.envelopes].sort((a, b) => {
    if (a.userId !== b.userId) {
      if (a.userId === sessionUserId) return -1;
      if (b.userId === sessionUserId) return 1;
    }
    return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
  });

  function resetForm() {
    setEditingId(null);
    setNome("");
    setDescricao("");
    setExpenseId("");
    setMetaValor("");
    setDataInicio(`${state.selectedMonth}-01`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionUserId || isLoading || !nome.trim()) return;

    const parsedMeta = metaValor.trim() ? Number(metaValor.replace(",", ".")) : null;
    const payload = {
      userId: sessionUserId,
      nome: nome.trim(),
      descricao: descricao.trim(),
      expenseId: expenseId || null,
      metaValor: parsedMeta && !Number.isNaN(parsedMeta) && parsedMeta > 0 ? parsedMeta : null,
      dataInicio,
    };

    if (editingId) {
      updateEnvelope(editingId, payload);
    } else {
      addEnvelope(payload);
    }
    resetForm();
  }

  function handleEdit(envelope: Envelope) {
    if (envelope.userId !== sessionUserId) return;
    setEditingId(envelope.id);
    setNome(envelope.nome);
    setDescricao(envelope.descricao);
    setExpenseId(envelope.expenseId ?? "");
    setMetaValor(envelope.metaValor ? String(envelope.metaValor) : "");
    setDataInicio(envelope.dataInicio);
  }

  function openMovement(envelopeId: string, tipo: EnvelopeTransactionType) {
    setMovement({ envelopeId, tipo });
    setMovValor("");
    setMovDescricao("");
    setMovData(month === toMonth() ? todayISO() : `${month}-01`);
  }

  function handleMovementSubmit(event: FormEvent<HTMLFormElement>, livreParaResgate: number) {
    event.preventDefault();
    if (!movement) return;
    const parsedValue = Number(movValor.replace(",", "."));
    if (Number.isNaN(parsedValue) || parsedValue <= 0) return;

    if (movement.tipo === "resgate" && parsedValue > livreParaResgate) {
      window.alert(
        `O resgate esta limitado a sobra de meses anteriores: ${currencyFormatter.format(
          livreParaResgate,
        )}. O aporte do mes atual so fica livre no proximo mes.`,
      );
      return;
    }

    addEnvelopeTransaction({
      envelopeId: movement.envelopeId,
      valor: parsedValue,
      tipo: movement.tipo,
      descricao: movDescricao.trim(),
      data: movData,
    });
    setMovement(null);
  }

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card
          subtitle="Envelopes de dinheiro: orcamentos (ex.: Lazer) ou metas (ex.: Viagem)"
          title={editingId ? "Editar Caixinha" : "Nova Caixinha"}
        >
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm text-muted">
              Nome
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Lazer, Viagem, Presentes"
                required
                value={nome}
              />
            </label>

            <label className="block text-sm text-muted">
              Descricao (opcional)
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Para que serve esta caixinha"
                value={descricao}
              />
            </label>

            <label className="block text-sm text-muted">
              Aporte automatico (despesa vinculada)
              <select
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setExpenseId(event.target.value)}
                value={expenseId}
              >
                <option value="">Sem aporte automatico</option>
                {myExpenses.map((expense) => (
                  <option key={expense.id} value={expense.id}>
                    {expense.titulo} ({currencyFormatter.format(expense.valor)}
                    {expense.recorrencia === "mensal" ? "/mes" : ", unica"})
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-muted">
                O valor da despesa entra na caixinha todo mes em que ela estiver ativa. Se
                alterar o valor da despesa, o aporte acompanha automaticamente.
              </span>
            </label>

            <label className="block text-sm text-muted">
              Meta (opcional)
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                min={0}
                onChange={(event) => setMetaValor(event.target.value)}
                placeholder="Ex.: 5000,00 para uma viagem"
                step="0.01"
                type="number"
                value={metaValor}
              />
            </label>

            <label className="block text-sm text-muted">
              Inicio dos aportes
              <input
                className="mt-1 w-full rounded-md border border-border bg-panelAlt px-3 py-2"
                onChange={(event) => setDataInicio(event.target.value)}
                type="date"
                value={dataInicio}
              />
              <span className="mt-1 block text-xs text-muted">
                Os aportes automaticos contam a partir deste mes (evita saldo retroativo de
                meses que ja passaram fora do sistema).
              </span>
            </label>

            <button
              className="w-full rounded-md border border-brand/50 bg-brand/20 px-3 py-2 font-semibold text-brand transition hover:bg-brand/30"
              type="submit"
            >
              {editingId ? "Salvar alteracoes" : "Criar caixinha"}
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

        <Card subtitle={`Saldos calculados para ${month}`} title="Caixinhas">
          {sortedEnvelopes.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhuma caixinha criada ainda. Crie uma ao lado — ex.: vincule a despesa do
              Lazer para controlar os gastos dentro do valor reservado.
            </p>
          ) : (
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-220px)]">
              {sortedEnvelopes.map((envelope) => {
                const owner = state.users.find((user) => user.id === envelope.userId);
                const isOwner = envelope.userId === sessionUserId;
                const linkedExpense =
                  state.expenses.find((expense) => expense.id === envelope.expenseId) ?? null;
                const summary = buildEnvelopeSummary(
                  envelope,
                  linkedExpense,
                  state.envelopeTransactions,
                  month,
                );
                const monthTransactions = state.envelopeTransactions.filter(
                  (tx) => tx.envelopeId === envelope.id && tx.data.slice(0, 7) === month,
                );
                const metaProgress = envelope.metaValor
                  ? Math.max(0, Math.min(100, (summary.saldoAtual / envelope.metaValor) * 100))
                  : null;
                const isMovementOpen = movement?.envelopeId === envelope.id;

                return (
                  <section
                    className="rounded-xl border border-border bg-panelAlt p-4"
                    key={envelope.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">{envelope.nome}</h3>
                        <p className="text-sm text-muted">
                          {owner?.nome}
                          {envelope.descricao ? ` | ${envelope.descricao}` : ""}
                        </p>
                        {linkedExpense ? (
                          <p className="mt-1 text-xs text-accent">
                            Aporte automatico: {linkedExpense.titulo} (
                            {currencyFormatter.format(linkedExpense.valor)}/mes)
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted">Saldo atual</p>
                        <strong
                          className={`text-lg ${
                            summary.saldoAtual < 0 ? "text-expense" : "text-brand"
                          }`}
                        >
                          {currencyFormatter.format(summary.saldoAtual)}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md border border-border bg-panel px-2 py-2">
                        <p className="text-xs text-muted">Entrou no mes</p>
                        <p className="text-sm font-medium text-income">
                          {currencyFormatter.format(summary.aporteMes + summary.depositosMes)}
                        </p>
                      </div>
                      <div className="rounded-md border border-border bg-panel px-2 py-2">
                        <p className="text-xs text-muted">Gasto no mes</p>
                        <p className="text-sm font-medium text-expense">
                          {currencyFormatter.format(summary.gastosMes)}
                        </p>
                      </div>
                      <div className="rounded-md border border-border bg-panel px-2 py-2">
                        <p className="text-xs text-muted">Livre p/ resgate</p>
                        <p className="text-sm font-medium text-accent">
                          {currencyFormatter.format(summary.livreParaResgate)}
                        </p>
                      </div>
                    </div>

                    {envelope.metaValor ? (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>Meta: {currencyFormatter.format(envelope.metaValor)}</span>
                          <span>{Math.round(metaProgress ?? 0)}%</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-panel">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${metaProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {isOwner ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="rounded-md border border-expense/40 bg-expense/10 px-3 py-1.5 text-xs text-expense transition hover:bg-expense/20"
                          onClick={() => openMovement(envelope.id, "gasto")}
                          type="button"
                        >
                          + Gasto
                        </button>
                        <button
                          className="rounded-md border border-income/40 bg-income/10 px-3 py-1.5 text-xs text-income transition hover:bg-income/20"
                          onClick={() => openMovement(envelope.id, "deposito")}
                          type="button"
                        >
                          + Deposito
                        </button>
                        <button
                          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent transition hover:bg-accent/20"
                          onClick={() => openMovement(envelope.id, "resgate")}
                          type="button"
                        >
                          Resgatar
                        </button>
                        <span className="ml-auto flex gap-2">
                          <button
                            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-text"
                            onClick={() => handleEdit(envelope)}
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            className="rounded-md border border-expense/40 bg-expense/10 px-3 py-1.5 text-xs text-expense transition hover:bg-expense/20"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Excluir esta caixinha? Todas as movimentacoes dela serao apagadas.",
                                )
                              ) {
                                deleteEnvelope(envelope.id);
                              }
                            }}
                            type="button"
                          >
                            Excluir
                          </button>
                        </span>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted">
                        Somente {owner?.nome} pode movimentar esta caixinha.
                      </p>
                    )}

                    {isMovementOpen && movement ? (
                      <form
                        className="mt-3 space-y-2 rounded-lg border border-border bg-panel p-3"
                        onSubmit={(event) =>
                          handleMovementSubmit(event, summary.livreParaResgate)
                        }
                      >
                        <p className="text-sm font-medium">
                          {movementLabels[movement.tipo]} em {envelope.nome}
                        </p>
                        {movement.tipo === "resgate" ? (
                          <p className="text-xs text-muted">
                            Disponivel para resgate (sobra de meses anteriores):{" "}
                            <strong className="text-accent">
                              {currencyFormatter.format(summary.livreParaResgate)}
                            </strong>
                          </p>
                        ) : null}
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            autoFocus
                            className="rounded-md border border-border bg-panelAlt px-3 py-2 text-sm"
                            min={0}
                            onChange={(event) => setMovValor(event.target.value)}
                            placeholder="Valor"
                            required
                            step="0.01"
                            type="number"
                            value={movValor}
                          />
                          <input
                            className="rounded-md border border-border bg-panelAlt px-3 py-2 text-sm"
                            onChange={(event) => setMovData(event.target.value)}
                            type="date"
                            value={movData}
                          />
                        </div>
                        <input
                          className="w-full rounded-md border border-border bg-panelAlt px-3 py-2 text-sm"
                          onChange={(event) => setMovDescricao(event.target.value)}
                          placeholder="Descricao (ex.: Cinema, Jantar)"
                          value={movDescricao}
                        />
                        <div className="flex gap-2">
                          <button
                            className="rounded-md border border-brand/50 bg-brand/20 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/30"
                            type="submit"
                          >
                            Confirmar
                          </button>
                          <button
                            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-text"
                            onClick={() => setMovement(null)}
                            type="button"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {monthTransactions.length > 0 ? (
                      <div className="mt-3 max-h-48 space-y-1 overflow-y-auto pr-1">
                        {monthTransactions.map((tx) => (
                          <div
                            className="flex items-center justify-between gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm"
                            key={tx.id}
                          >
                            <span className="text-muted">
                              {tx.data.slice(8, 10)}/{tx.data.slice(5, 7)} |{" "}
                              {movementLabels[tx.tipo]}
                              {tx.descricao ? ` | ${tx.descricao}` : ""}
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <strong
                                className={
                                  tx.tipo === "deposito" ? "text-income" : "text-expense"
                                }
                              >
                                {tx.tipo === "deposito" ? "+" : "-"}
                                {currencyFormatter.format(tx.valor)}
                              </strong>
                              {isOwner ? (
                                <button
                                  className="text-xs text-muted transition hover:text-expense"
                                  onClick={() => {
                                    if (window.confirm("Remover esta movimentacao?")) {
                                      deleteEnvelopeTransaction(tx.id);
                                    }
                                  }}
                                  type="button"
                                >
                                  x
                                </button>
                              ) : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted">
                        Nenhuma movimentacao em {month}.
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
