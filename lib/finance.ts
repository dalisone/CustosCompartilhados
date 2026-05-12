import {
  Compensation,
  Expense,
  FinanceState,
  Income,
  SavingsTransaction,
  UserBalance,
} from "@/lib/types";

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function toMonth(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isInMonth(referenceDate: string, month: string): boolean {
  return referenceDate.slice(0, 7) === month;
}

function monthDiff(startMonth: string, targetMonth: string): number {
  const [startYear, startMonthNumber] = startMonth.split("-").map(Number);
  const [targetYear, targetMonthNumber] = targetMonth.split("-").map(Number);
  return (targetYear - startYear) * 12 + (targetMonthNumber - startMonthNumber);
}

function isEntryActiveInMonth(
  recorrencia: "mensal" | "unica",
  dataBase: string,
  month: string,
  ativo: boolean,
  quantidadeParcelas?: number | null,
): boolean {
  if (!ativo) return false;
  if (recorrencia === "unica") return isInMonth(dataBase, month);

  const startMonth = dataBase.slice(0, 7);
  if (startMonth > month) return false;

  if (!quantidadeParcelas || quantidadeParcelas <= 0) return true;
  const elapsed = monthDiff(startMonth, month);
  return elapsed >= 0 && elapsed < quantidadeParcelas;
}

export function resolveMonthIncomes(incomes: Income[], month: string): Income[] {
  return incomes.filter((income) =>
    isEntryActiveInMonth(income.recorrencia, income.dataInicio, month, income.ativo, null),
  );
}

export function resolveMonthExpenses(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((expense) =>
    isEntryActiveInMonth(
      expense.recorrencia,
      expense.dataReferencia,
      month,
      expense.ativo,
      expense.quantidadeParcelas,
    ),
  );
}

export function getParcelaInfo(expense: Expense, month: string) {
  if (expense.recorrencia !== "mensal" || !expense.quantidadeParcelas || expense.quantidadeParcelas <= 0) {
    return null;
  }

  const startMonth = expense.dataReferencia.slice(0, 7);
  const elapsed = monthDiff(startMonth, month);
  if (elapsed < 0) return `Inicia em ${startMonth}`;

  const parcelaAtual = Math.min(elapsed + 1, expense.quantidadeParcelas);
  return `${parcelaAtual}/${expense.quantidadeParcelas} parcelas`;
}

export function totalAmount(values: Array<{ valor: number }>): number {
  return values.reduce((acc, item) => acc + item.valor, 0);
}

export function savingsBalance(transactions: SavingsTransaction[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.tipo === "deposito") return acc + tx.valor;
    return acc - tx.valor;
  }, 0);
}

export function buildUserBalances(state: FinanceState): UserBalance[] {
  const monthIncomes = resolveMonthIncomes(state.incomes, state.selectedMonth);
  const monthExpenses = resolveMonthExpenses(state.expenses, state.selectedMonth);

  return state.users.map((user) => {
    const renda = totalAmount(monthIncomes.filter((income) => income.userId === user.id));
    const despesas = totalAmount(
      monthExpenses.filter((expense) => expense.responsibleUserId === user.id),
    );

    return {
      userId: user.id,
      nome: user.nome,
      renda,
      despesas,
      saldo: renda - despesas,
    };
  });
}

export function calculateCompensation(state: FinanceState): Compensation[] {
  const balances = buildUserBalances(state);
  const deficits = balances
    .filter((b) => b.saldo < 0)
    .map((b) => ({ ...b, remaining: Math.abs(b.saldo) }))
    .sort((a, b) => b.remaining - a.remaining);
  const surpluses = balances
    .filter((b) => b.saldo > 0)
    .map((b) => ({ ...b, remaining: b.saldo }))
    .sort((a, b) => b.remaining - a.remaining);

  const transfers: Compensation[] = [];
  let deficitIndex = 0;
  let surplusIndex = 0;

  while (deficitIndex < deficits.length && surplusIndex < surpluses.length) {
    const deficit = deficits[deficitIndex];
    const surplus = surpluses[surplusIndex];
    const value = Math.min(deficit.remaining, surplus.remaining);

    if (value > 0) {
      transfers.push({
        fromUserId: surplus.userId,
        fromNome: surplus.nome,
        toUserId: deficit.userId,
        toNome: deficit.nome,
        valor: value,
      });
      deficit.remaining -= value;
      surplus.remaining -= value;
    }

    if (deficit.remaining === 0) deficitIndex += 1;
    if (surplus.remaining === 0) surplusIndex += 1;
  }

  return transfers;
}

export function monthlyOverview(state: FinanceState) {
  const monthIncomes = resolveMonthIncomes(state.incomes, state.selectedMonth);
  const monthExpenses = resolveMonthExpenses(state.expenses, state.selectedMonth);
  const entradas = totalAmount(monthIncomes);
  const saidas = totalAmount(monthExpenses);
  const saldoMensal = entradas - saidas;
  const guardado = savingsBalance(state.savingsTransactions);
  const saldoLivre = saldoMensal + guardado;

  return {
    entradas,
    saidas,
    saldoMensal,
    guardado,
    saldoLivre,
    usaReserva: saldoMensal < 0 && guardado > 0,
    monthIncomes,
    monthExpenses,
  };
}
