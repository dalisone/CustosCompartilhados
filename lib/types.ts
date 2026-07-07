export type Recurrence = "mensal" | "unica";
export type SavingsType = "deposito" | "resgate";
export type FundingSource = "saldo_mensal" | "guardado" | "misto";

export interface User {
  id: string;
  nome: string;
  email: string;
}

export interface Income {
  id: string;
  userId: string;
  titulo: string;
  valor: number;
  recorrencia: Recurrence;
  dataInicio: string;
  ativo: boolean;
}

export interface Expense {
  id: string;
  responsibleUserId: string;
  titulo: string;
  valor: number;
  recorrencia: Recurrence;
  quantidadeParcelas?: number | null;
  categoria: string;
  dataReferencia: string;
  fonte: FundingSource;
  ativo: boolean;
}

export interface SavingsTransaction {
  id: string;
  userId: string;
  valor: number;
  tipo: SavingsType;
  descricao: string;
  createdAt: string;
}

export type EnvelopeTransactionType = "gasto" | "deposito" | "resgate";

export interface Envelope {
  id: string;
  userId: string;
  nome: string;
  descricao: string;
  expenseId: string | null;
  metaValor: number | null;
  dataInicio: string;
  ativo: boolean;
}

export interface EnvelopeTransaction {
  id: string;
  envelopeId: string;
  valor: number;
  tipo: EnvelopeTransactionType;
  descricao: string;
  data: string;
  createdAt: string;
}

export interface FinanceState {
  users: User[];
  incomes: Income[];
  expenses: Expense[];
  savingsTransactions: SavingsTransaction[];
  envelopes: Envelope[];
  envelopeTransactions: EnvelopeTransaction[];
  selectedMonth: string;
}

export interface UserBalance {
  userId: string;
  nome: string;
  renda: number;
  despesas: number;
  saldo: number;
}

export interface Compensation {
  fromUserId: string;
  fromNome: string;
  toUserId: string;
  toNome: string;
  valor: number;
}
