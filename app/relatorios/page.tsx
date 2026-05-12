"use client";

import { AppShell, Card } from "@/components/app-shell";
import { currencyFormatter, monthlyOverview } from "@/lib/finance";
import { useFinance } from "@/lib/store";

export default function RelatoriosPage() {
  const { state } = useFinance();
  const overview = monthlyOverview(state);

  const categoryTotals = overview.monthExpenses.reduce<Record<string, number>>((acc, expense) => {
    const current = acc[expense.categoria] ?? 0;
    acc[expense.categoria] = current + expense.valor;
    return acc;
  }, {});

  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card subtitle={`Visao sintetica para ${state.selectedMonth}`} title="Resumo Mensal">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-md border border-border bg-panelAlt p-3">
              <span className="text-muted">Entradas</span>
              <strong className="text-income">{currencyFormatter.format(overview.entradas)}</strong>
            </li>
            <li className="flex items-center justify-between rounded-md border border-border bg-panelAlt p-3">
              <span className="text-muted">Despesas</span>
              <strong className="text-expense">{currencyFormatter.format(overview.saidas)}</strong>
            </li>
            <li className="flex items-center justify-between rounded-md border border-border bg-panelAlt p-3">
              <span className="text-muted">Saldo mensal</span>
              <strong className={overview.saldoMensal >= 0 ? "text-brand" : "text-expense"}>
                {currencyFormatter.format(overview.saldoMensal)}
              </strong>
            </li>
            <li className="flex items-center justify-between rounded-md border border-border bg-panelAlt p-3">
              <span className="text-muted">Guardado</span>
              <strong className="text-accent">{currencyFormatter.format(overview.guardado)}</strong>
            </li>
          </ul>
        </Card>

        <Card subtitle="Total de gastos por categoria no mes selecionado" title="Despesas por Categoria">
          {categories.length === 0 ? (
            <p className="text-sm text-muted">Sem despesas para consolidar neste mes.</p>
          ) : (
            <div className="space-y-2">
              {categories.map(([category, amount]) => (
                <article
                  className="flex items-center justify-between rounded-md border border-border bg-panelAlt p-3"
                  key={category}
                >
                  <h3 className="text-sm font-medium">{category}</h3>
                  <strong className="text-expense">{currencyFormatter.format(amount)}</strong>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

