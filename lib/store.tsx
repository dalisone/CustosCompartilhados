"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toMonth } from "@/lib/finance";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  Envelope,
  EnvelopeTransaction,
  Expense,
  FinanceState,
  Income,
  SavingsTransaction,
  User,
} from "@/lib/types";

interface FinanceContextValue {
  state: FinanceState;
  isLoading: boolean;
  sessionUserId: string | null;
  refreshData: () => Promise<void>;
  addIncome: (input: Omit<Income, "id" | "ativo">) => Promise<void>;
  updateIncome: (id: string, input: Omit<Income, "id" | "ativo">) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (input: Omit<Expense, "id" | "ativo">) => Promise<void>;
  updateExpense: (id: string, input: Omit<Expense, "id" | "ativo">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addSavings: (input: Omit<SavingsTransaction, "id" | "createdAt">) => Promise<void>;
  updateSavings: (
    id: string,
    input: Omit<SavingsTransaction, "id" | "createdAt">,
  ) => Promise<void>;
  deleteSavings: (id: string) => Promise<void>;
  addEnvelope: (input: Omit<Envelope, "id" | "ativo">) => Promise<void>;
  updateEnvelope: (id: string, input: Omit<Envelope, "id" | "ativo">) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  addEnvelopeTransaction: (
    input: Omit<EnvelopeTransaction, "id" | "createdAt">,
  ) => Promise<void>;
  deleteEnvelopeTransaction: (id: string) => Promise<void>;
  setMonth: (month: string) => void;
  updateCurrentUserName: (nome: string) => Promise<void>;
}

type IncomeRow = {
  id: string;
  user_id: string;
  titulo: string;
  valor: number;
  recorrencia: "mensal" | "unica";
  data_inicio: string;
  ativo: boolean;
};

type ExpenseRow = {
  id: string;
  responsible_user_id: string;
  titulo: string;
  valor: number;
  recorrencia: "mensal" | "unica";
  quantidade_parcelas: number | null;
  categoria: string;
  data_referencia: string;
  fonte: "saldo_mensal" | "guardado" | "misto";
  ativo: boolean;
};

type SavingsRow = {
  id: string;
  user_id: string;
  valor: number;
  tipo: "deposito" | "resgate";
  descricao: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  nome: string;
  email: string;
};

type EnvelopeRow = {
  id: string;
  user_id: string;
  nome: string;
  descricao: string;
  expense_id: string | null;
  meta_valor: number | null;
  data_inicio: string;
  ativo: boolean;
};

type EnvelopeTransactionRow = {
  id: string;
  envelope_id: string;
  valor: number;
  tipo: "gasto" | "deposito" | "resgate";
  descricao: string;
  data: string;
  created_at: string;
};

const initialState: FinanceState = {
  users: [],
  incomes: [],
  expenses: [],
  savingsTransactions: [],
  envelopes: [],
  envelopeTransactions: [],
  selectedMonth: toMonth(),
};

function mapIncomeRow(row: IncomeRow): Income {
  return {
    id: row.id,
    userId: row.user_id,
    titulo: row.titulo,
    valor: Number(row.valor),
    recorrencia: row.recorrencia,
    dataInicio: row.data_inicio,
    ativo: row.ativo,
  };
}

function mapExpenseRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    responsibleUserId: row.responsible_user_id,
    titulo: row.titulo,
    valor: Number(row.valor),
    recorrencia: row.recorrencia,
    quantidadeParcelas: row.quantidade_parcelas,
    categoria: row.categoria,
    dataReferencia: row.data_referencia,
    fonte: row.fonte,
    ativo: row.ativo,
  };
}

function mapSavingsRow(row: SavingsRow): SavingsTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    valor: Number(row.valor),
    tipo: row.tipo,
    descricao: row.descricao,
    createdAt: row.created_at,
  };
}

function mapEnvelopeRow(row: EnvelopeRow): Envelope {
  return {
    id: row.id,
    userId: row.user_id,
    nome: row.nome,
    descricao: row.descricao,
    expenseId: row.expense_id,
    metaValor: row.meta_valor === null ? null : Number(row.meta_valor),
    dataInicio: row.data_inicio,
    ativo: row.ativo,
  };
}

function mapEnvelopeTransactionRow(row: EnvelopeTransactionRow): EnvelopeTransaction {
  return {
    id: row.id,
    envelopeId: row.envelope_id,
    valor: Number(row.valor),
    tipo: row.tipo,
    descricao: row.descricao,
    data: row.data,
    createdAt: row.created_at,
  };
}

function toDateOnly(value: string): string {
  return value.length >= 10 ? value.slice(0, 10) : value;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FinanceState>(initialState);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async (userId: string | null) => {
    if (!isSupabaseConfigured) {
      setState((prev) => ({
        ...prev,
        users: [],
        incomes: [],
        expenses: [],
        savingsTransactions: [],
        envelopes: [],
        envelopeTransactions: [],
      }));
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setState((prev) => ({
        ...prev,
        users: [],
        incomes: [],
        expenses: [],
        savingsTransactions: [],
        envelopes: [],
        envelopeTransactions: [],
      }));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const supabase = getSupabaseClient();

    const [profilesRes, incomesRes, expensesRes, savingsRes, envelopesRes, envelopeTxRes] =
      await Promise.all([
        supabase.from("profiles").select("id,nome,email").order("nome", { ascending: true }),
        supabase.from("incomes").select("*").order("data_inicio", { ascending: false }),
        supabase.from("expenses").select("*").order("data_referencia", { ascending: false }),
        supabase
          .from("savings_transactions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("envelopes").select("*").order("created_at", { ascending: true }),
        supabase
          .from("envelope_transactions")
          .select("*")
          .order("data", { ascending: false }),
      ]);

    if (profilesRes.error || incomesRes.error || expensesRes.error || savingsRes.error) {
      setState((prev) => ({
        ...prev,
        users: [],
        incomes: [],
        expenses: [],
        savingsTransactions: [],
        envelopes: [],
        envelopeTransactions: [],
      }));
      setIsLoading(false);
      return;
    }

    const users: User[] = (profilesRes.data as ProfileRow[]).map((item) => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
    }));
    const incomes: Income[] = (incomesRes.data as IncomeRow[]).map(mapIncomeRow);
    const expenses: Expense[] = (expensesRes.data as ExpenseRow[]).map(mapExpenseRow);
    const savingsTransactions: SavingsTransaction[] = (savingsRes.data as SavingsRow[]).map(
      mapSavingsRow,
    );
    // Tolerante a erro: se as tabelas de caixinhas ainda nao foram criadas no
    // Supabase, o restante do app continua funcionando normalmente.
    const envelopes: Envelope[] = envelopesRes.error
      ? []
      : (envelopesRes.data as EnvelopeRow[]).map(mapEnvelopeRow);
    const envelopeTransactions: EnvelopeTransaction[] = envelopeTxRes.error
      ? []
      : (envelopeTxRes.data as EnvelopeTransactionRow[]).map(mapEnvelopeTransactionRow);

    setState((prev) => ({
      ...prev,
      users,
      incomes,
      expenses,
      savingsTransactions,
      envelopes,
      envelopeTransactions,
    }));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;

    if (!isSupabaseConfigured) {
      setSessionUserId(null);
      setIsLoading(false);
      return () => {
        alive = false;
      };
    }

    const supabase = getSupabaseClient();

    const bootstrap = async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      const userId = data.user?.id ?? null;
      setSessionUserId(userId);
      await loadAllData(userId);
    };

    void bootstrap();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      setIsLoading(true);
      setSessionUserId(nextUserId);
      setTimeout(() => {
        void loadAllData(nextUserId);
      }, 0);
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [loadAllData]);

  const refreshData = useCallback(async () => {
    await loadAllData(sessionUserId);
  }, [loadAllData, sessionUserId]);

  const addIncome = useCallback(async (input: Omit<Income, "id" | "ativo">) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("incomes")
      .insert({
        user_id: input.userId,
        titulo: input.titulo,
        valor: input.valor,
        recorrencia: input.recorrencia,
        data_inicio: toDateOnly(input.dataInicio),
        ativo: true,
      })
      .select("*")
      .single();

    if (!error && data) {
      setState((prev) => ({ ...prev, incomes: [mapIncomeRow(data), ...prev.incomes] }));
    }
  }, []);

  const updateIncome = useCallback(async (id: string, input: Omit<Income, "id" | "ativo">) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("incomes")
      .update({
        user_id: input.userId,
        titulo: input.titulo,
        valor: input.valor,
        recorrencia: input.recorrencia,
        data_inicio: toDateOnly(input.dataInicio),
        ativo: true,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) {
      const mapped = mapIncomeRow(data);
      setState((prev) => ({
        ...prev,
        incomes: prev.incomes.map((item) => (item.id === id ? mapped : item)),
      }));
    }
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("incomes").delete().eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        incomes: prev.incomes.filter((item) => item.id !== id),
      }));
    }
  }, []);

  const addExpense = useCallback(async (input: Omit<Expense, "id" | "ativo">) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        responsible_user_id: input.responsibleUserId,
        titulo: input.titulo,
        valor: input.valor,
        recorrencia: input.recorrencia,
        quantidade_parcelas: input.quantidadeParcelas ?? null,
        categoria: input.categoria,
        data_referencia: toDateOnly(input.dataReferencia),
        fonte: input.fonte,
        ativo: true,
      })
      .select("*")
      .single();

    if (!error && data) {
      setState((prev) => ({ ...prev, expenses: [mapExpenseRow(data), ...prev.expenses] }));
    }
  }, []);

  const updateExpense = useCallback(async (id: string, input: Omit<Expense, "id" | "ativo">) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("expenses")
      .update({
        responsible_user_id: input.responsibleUserId,
        titulo: input.titulo,
        valor: input.valor,
        recorrencia: input.recorrencia,
        quantidade_parcelas: input.quantidadeParcelas ?? null,
        categoria: input.categoria,
        data_referencia: toDateOnly(input.dataReferencia),
        fonte: input.fonte,
        ativo: true,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) {
      const mapped = mapExpenseRow(data);
      setState((prev) => ({
        ...prev,
        expenses: prev.expenses.map((item) => (item.id === id ? mapped : item)),
      }));
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((item) => item.id !== id),
      }));
    }
  }, []);

  const addSavings = useCallback(async (input: Omit<SavingsTransaction, "id" | "createdAt">) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("savings_transactions")
      .insert({
        user_id: input.userId,
        valor: input.valor,
        tipo: input.tipo,
        descricao: input.descricao,
      })
      .select("*")
      .single();

    if (!error && data) {
      setState((prev) => ({
        ...prev,
        savingsTransactions: [mapSavingsRow(data), ...prev.savingsTransactions],
      }));
    }
  }, []);

  const updateSavings = useCallback(
    async (id: string, input: Omit<SavingsTransaction, "id" | "createdAt">) => {
      if (!isSupabaseConfigured) return;
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("savings_transactions")
        .update({
          user_id: input.userId,
          valor: input.valor,
          tipo: input.tipo,
          descricao: input.descricao,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (!error && data) {
        const mapped = mapSavingsRow(data);
        setState((prev) => ({
          ...prev,
          savingsTransactions: prev.savingsTransactions.map((item) =>
            item.id === id ? mapped : item,
          ),
        }));
      }
    },
    [],
  );

  const deleteSavings = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("savings_transactions").delete().eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        savingsTransactions: prev.savingsTransactions.filter((item) => item.id !== id),
      }));
    }
  }, []);

  const addEnvelope = useCallback(async (input: Omit<Envelope, "id" | "ativo">) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("envelopes")
      .insert({
        user_id: input.userId,
        nome: input.nome,
        descricao: input.descricao,
        expense_id: input.expenseId,
        meta_valor: input.metaValor,
        data_inicio: toDateOnly(input.dataInicio),
        ativo: true,
      })
      .select("*")
      .single();

    if (!error && data) {
      setState((prev) => ({ ...prev, envelopes: [...prev.envelopes, mapEnvelopeRow(data)] }));
    }
  }, []);

  const updateEnvelope = useCallback(
    async (id: string, input: Omit<Envelope, "id" | "ativo">) => {
      if (!isSupabaseConfigured) return;
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("envelopes")
        .update({
          user_id: input.userId,
          nome: input.nome,
          descricao: input.descricao,
          expense_id: input.expenseId,
          meta_valor: input.metaValor,
          data_inicio: toDateOnly(input.dataInicio),
          ativo: true,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (!error && data) {
        const mapped = mapEnvelopeRow(data);
        setState((prev) => ({
          ...prev,
          envelopes: prev.envelopes.map((item) => (item.id === id ? mapped : item)),
        }));
      }
    },
    [],
  );

  const deleteEnvelope = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("envelopes").delete().eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        envelopes: prev.envelopes.filter((item) => item.id !== id),
        envelopeTransactions: prev.envelopeTransactions.filter(
          (item) => item.envelopeId !== id,
        ),
      }));
    }
  }, []);

  const addEnvelopeTransaction = useCallback(
    async (input: Omit<EnvelopeTransaction, "id" | "createdAt">) => {
      if (!isSupabaseConfigured) return;
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("envelope_transactions")
        .insert({
          envelope_id: input.envelopeId,
          valor: input.valor,
          tipo: input.tipo,
          descricao: input.descricao,
          data: toDateOnly(input.data),
        })
        .select("*")
        .single();

      if (!error && data) {
        setState((prev) => ({
          ...prev,
          envelopeTransactions: [
            mapEnvelopeTransactionRow(data),
            ...prev.envelopeTransactions,
          ],
        }));
      }
    },
    [],
  );

  const deleteEnvelopeTransaction = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("envelope_transactions").delete().eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        envelopeTransactions: prev.envelopeTransactions.filter((item) => item.id !== id),
      }));
    }
  }, []);

  const setMonth = useCallback((month: string) => {
    setState((prev) => ({ ...prev, selectedMonth: month }));
  }, []);

  const updateCurrentUserName = useCallback(
    async (nome: string) => {
      if (!isSupabaseConfigured) return;
      const supabase = getSupabaseClient();
      if (!sessionUserId) return;
      const cleaned = nome.trim();
      if (!cleaned) return;

      const { error } = await supabase
        .from("profiles")
        .update({ nome: cleaned })
        .eq("id", sessionUserId);

      if (!error) {
        setState((prev) => ({
          ...prev,
          users: prev.users.map((user) =>
            user.id === sessionUserId ? { ...user, nome: cleaned } : user,
          ),
        }));
      }
    },
    [sessionUserId],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      state,
      isLoading,
      sessionUserId,
      refreshData,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addSavings,
      updateSavings,
      deleteSavings,
      addEnvelope,
      updateEnvelope,
      deleteEnvelope,
      addEnvelopeTransaction,
      deleteEnvelopeTransaction,
      setMonth,
      updateCurrentUserName,
    }),
    [
      state,
      isLoading,
      sessionUserId,
      refreshData,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addSavings,
      updateSavings,
      deleteSavings,
      addEnvelope,
      updateEnvelope,
      deleteEnvelope,
      addEnvelopeTransaction,
      deleteEnvelopeTransaction,
      setMonth,
      updateCurrentUserName,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance deve ser usado dentro de FinanceProvider");
  return context;
}
