"use client";

import { AppShell, Card } from "@/components/app-shell";
import { buildUserBalances, calculateCompensation, currencyFormatter, monthlyOverview } from "@/lib/finance";
import { useFinance } from "@/lib/store";

function KpiValue({
  value,
  tone,
}: {
  value: number;
  tone: "income" | "expense" | "brand" | "accent";
}) {
  const toneClass = {
    income: "text-income",
    expense: "text-expense",
    brand: "text-brand",
    accent: "text-accent",
  }[tone];

  return (
    <p className={`mt-4 break-words font-mono text-[clamp(1.8rem,2vw,2.6rem)] font-semibold leading-none tracking-tight tabular-nums ${toneClass}`}>
      {currencyFormatter.format(value)}
    </p>
  );
}

export default function DashboardPage() {
  const { state } = useFinance();
  const overview = monthlyOverview(state);
  const balances = buildUserBalances(state);
  const transfers = calculateCompensation(state);

  return (
    <AppShell>
      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] 2xl:[grid-template-columns:repeat(5,minmax(0,1fr))]">
        <Card subtitle="Entradas no mes selecionado" title="Entradas">
          <KpiValue tone="income" value={overview.entradas} />
        </Card>
        <Card subtitle="Saidas no mes selecionado" title="Despesas">
          <KpiValue tone="expense" value={overview.saidas} />
        </Card>
        <Card subtitle="Entradas - Despesas" title="Saldo Mensal">
          <KpiValue
            tone={overview.saldoMensal >= 0 ? "brand" : "expense"}
            value={overview.saldoMensal}
          />
        </Card>
        <Card subtitle="Depositos - Resgates" title="Guardado">
          <KpiValue tone="accent" value={overview.guardado} />
        </Card>
        <Card subtitle="Saldo mensal + guardado" title="Saldo Livre">
          <KpiValue
            tone={overview.saldoLivre >= 0 ? "brand" : "expense"}
            value={overview.saldoLivre}
          />
        </Card>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card subtitle="Quem cobre e quem precisa de complemento" title="Equilibrio Individual">
          <div className="space-y-3">
            {balances.map((balance) => (
              <article
                className="rounded-lg border border-border bg-panelAlt p-3"
                key={balance.userId}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{balance.nome}</h3>
                  <strong className={balance.saldo >= 0 ? "text-brand" : "text-expense"}>
                    {currencyFormatter.format(balance.saldo)}
                  </strong>
                </div>
                <p className="text-sm text-muted">
                  Renda: {currencyFormatter.format(balance.renda)} | Despesas:{" "}
                  {currencyFormatter.format(balance.despesas)}
                </p>
              </article>
            ))}
          </div>
        </Card>

        <Card subtitle="Sugestao automatica para compensacao do mes" title="Compensacoes">
          {transfers.length === 0 ? (
            <p className="rounded-lg border border-brand/30 bg-brand/10 p-3 text-sm text-brand">
              Nao ha compensacao necessaria neste mes.
            </p>
          ) : (
            <ul className="space-y-2">
              {transfers.map((transfer, index) => (
                <li
                  className="rounded-lg border border-border bg-panelAlt p-3 text-sm"
                  key={`${transfer.fromUserId}-${transfer.toUserId}-${index}`}
                >
                  <strong>{transfer.fromNome}</strong> complementa{" "}
                  <strong>{transfer.toNome}</strong> em{" "}
                  <strong className="text-accent">{currencyFormatter.format(transfer.valor)}</strong>.
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {overview.usaReserva ? (
        <section className="mt-4 rounded-xl2 border border-accent/40 bg-accent/10 p-4">
          <h2 className="text-lg font-semibold text-accent">Alerta inteligente</h2>
          <p className="mt-1 text-sm text-zinc-200">
            As despesas do mes excedem as entradas. Existe reserva guardada para cobrir
            esta diferenca, se desejarem.
          </p>
        </section>
      ) : null}
    </AppShell>
  );
}
