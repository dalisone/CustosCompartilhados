"use client";

import { AppShell, Card } from "@/components/app-shell";
import { buildUserBalances, calculateCompensation, currencyFormatter } from "@/lib/finance";
import { useFinance } from "@/lib/store";

export default function EquilibrioPage() {
  const { state } = useFinance();
  const balances = buildUserBalances(state);
  const compensations = calculateCompensation(state);

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          subtitle="Saldo individual = renda individual - despesas sob sua responsabilidade"
          title="Saldo por Pessoa"
        >
          <div className="space-y-3">
            {balances.map((balance) => (
              <article
                className="rounded-lg border border-border bg-panelAlt p-4"
                key={balance.userId}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-base font-semibold">{balance.nome}</h3>
                  <strong className={balance.saldo >= 0 ? "text-brand" : "text-expense"}>
                    {currencyFormatter.format(balance.saldo)}
                  </strong>
                </div>
                <p className="text-sm text-muted">
                  Renda: {currencyFormatter.format(balance.renda)}
                </p>
                <p className="text-sm text-muted">
                  Despesas: {currencyFormatter.format(balance.despesas)}
                </p>
              </article>
            ))}
          </div>
        </Card>

        <Card subtitle="Transferencias sugeridas para equilibrar o mes" title="Compensacao Automatica">
          {compensations.length === 0 ? (
            <p className="rounded-lg border border-brand/30 bg-brand/10 p-3 text-sm text-brand">
              Mes equilibrado. Nenhuma compensacao necessaria.
            </p>
          ) : (
            <ul className="space-y-2">
              {compensations.map((item, idx) => (
                <li className="rounded-lg border border-border bg-panelAlt p-3" key={idx}>
                  <p className="text-sm">
                    <strong>{item.fromNome}</strong> transfere{" "}
                    <strong className="text-accent">{currencyFormatter.format(item.valor)}</strong>{" "}
                    para <strong>{item.toNome}</strong>.
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 rounded-lg border border-border bg-black/20 p-3 text-sm text-muted">
            Regra usada: quando o saldo individual fica negativo, o sistema calcula complemento
            usando quem teve saldo positivo no mesmo mes.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

