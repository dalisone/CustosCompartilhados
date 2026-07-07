-- Caixinhas (envelopes de dinheiro por usuario).
-- Execute este script no Supabase SQL Editor. Pode rodar mais de uma vez sem problema.

create table if not exists public.envelopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  nome text not null,
  descricao text not null default '',
  -- Despesa vinculada: o valor dela vira o aporte automatico mensal da caixinha.
  expense_id uuid null references public.expenses (id) on delete set null,
  -- Meta opcional (caixinha de objetivo, ex.: juntar para uma viagem).
  meta_valor numeric(12, 2) null check (meta_valor is null or meta_valor > 0),
  -- Aportes automaticos contam a partir deste mes.
  data_inicio date not null default current_date,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.envelope_transactions (
  id uuid primary key default gen_random_uuid(),
  envelope_id uuid not null references public.envelopes (id) on delete cascade,
  valor numeric(12, 2) not null check (valor >= 0),
  tipo text not null check (tipo in ('gasto', 'deposito', 'resgate')),
  descricao text not null default '',
  data date not null default current_date,
  -- Gastos recorrentes/parcelados: valor e o da parcela, data e a base.
  recorrencia text not null default 'unica' check (recorrencia in ('unica', 'mensal')),
  quantidade_parcelas integer null check (quantidade_parcelas is null or quantidade_parcelas > 0),
  created_at timestamptz not null default now()
);

-- Se voce ja tinha rodado este script antes, os alters abaixo adicionam as
-- colunas novas sem perder dados (sao ignorados se as colunas ja existem).
alter table public.envelope_transactions
  add column if not exists recorrencia text not null default 'unica';
alter table public.envelope_transactions
  add column if not exists quantidade_parcelas integer null;

create index if not exists idx_envelopes_user_id on public.envelopes (user_id);
create index if not exists idx_envelope_tx_envelope_id on public.envelope_transactions (envelope_id);

alter table public.envelopes enable row level security;
alter table public.envelope_transactions enable row level security;

drop policy if exists envelopes_select_all on public.envelopes;
create policy envelopes_select_all
on public.envelopes
for select
to authenticated
using (true);

drop policy if exists envelopes_insert_own on public.envelopes;
create policy envelopes_insert_own
on public.envelopes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists envelopes_update_own on public.envelopes;
create policy envelopes_update_own
on public.envelopes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists envelopes_delete_own on public.envelopes;
create policy envelopes_delete_own
on public.envelopes
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists envelope_tx_select_all on public.envelope_transactions;
create policy envelope_tx_select_all
on public.envelope_transactions
for select
to authenticated
using (true);

drop policy if exists envelope_tx_insert_own on public.envelope_transactions;
create policy envelope_tx_insert_own
on public.envelope_transactions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.envelopes e
    where e.id = envelope_id
      and e.user_id = (select auth.uid())
  )
);

drop policy if exists envelope_tx_update_own on public.envelope_transactions;
create policy envelope_tx_update_own
on public.envelope_transactions
for update
to authenticated
using (
  exists (
    select 1
    from public.envelopes e
    where e.id = envelope_id
      and e.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.envelopes e
    where e.id = envelope_id
      and e.user_id = (select auth.uid())
  )
);

drop policy if exists envelope_tx_delete_own on public.envelope_transactions;
create policy envelope_tx_delete_own
on public.envelope_transactions
for delete
to authenticated
using (
  exists (
    select 1
    from public.envelopes e
    where e.id = envelope_id
      and e.user_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.envelopes to authenticated;
grant select, insert, update, delete on public.envelope_transactions to authenticated;
