-- Execute este script no Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default 'Usuario',
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1), 'Usuario'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  titulo text not null,
  valor numeric(12, 2) not null check (valor >= 0),
  recorrencia text not null check (recorrencia in ('mensal', 'unica')),
  data_inicio date not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  responsible_user_id uuid not null references public.profiles (id) on delete cascade,
  titulo text not null,
  valor numeric(12, 2) not null check (valor >= 0),
  recorrencia text not null check (recorrencia in ('mensal', 'unica')),
  quantidade_parcelas integer null check (quantidade_parcelas is null or quantidade_parcelas > 0),
  categoria text not null,
  data_referencia date not null,
  fonte text not null check (fonte in ('saldo_mensal', 'guardado', 'misto')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  valor numeric(12, 2) not null check (valor >= 0),
  tipo text not null check (tipo in ('deposito', 'resgate')),
  descricao text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_incomes_user_id on public.incomes (user_id);
create index if not exists idx_expenses_user_id on public.expenses (responsible_user_id);
create index if not exists idx_savings_user_id on public.savings_transactions (user_id);

alter table public.profiles enable row level security;
alter table public.incomes enable row level security;
alter table public.expenses enable row level security;
alter table public.savings_transactions enable row level security;

drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all
on public.profiles
for select
to authenticated
using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists incomes_select_all on public.incomes;
create policy incomes_select_all
on public.incomes
for select
to authenticated
using (true);

drop policy if exists incomes_insert_own on public.incomes;
create policy incomes_insert_own
on public.incomes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists incomes_update_own on public.incomes;
create policy incomes_update_own
on public.incomes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists incomes_delete_own on public.incomes;
create policy incomes_delete_own
on public.incomes
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists expenses_select_all on public.expenses;
create policy expenses_select_all
on public.expenses
for select
to authenticated
using (true);

drop policy if exists expenses_insert_own on public.expenses;
create policy expenses_insert_own
on public.expenses
for insert
to authenticated
with check ((select auth.uid()) = responsible_user_id);

drop policy if exists expenses_update_own on public.expenses;
create policy expenses_update_own
on public.expenses
for update
to authenticated
using ((select auth.uid()) = responsible_user_id)
with check ((select auth.uid()) = responsible_user_id);

drop policy if exists expenses_delete_own on public.expenses;
create policy expenses_delete_own
on public.expenses
for delete
to authenticated
using ((select auth.uid()) = responsible_user_id);

drop policy if exists savings_select_all on public.savings_transactions;
create policy savings_select_all
on public.savings_transactions
for select
to authenticated
using (true);

drop policy if exists savings_insert_own on public.savings_transactions;
create policy savings_insert_own
on public.savings_transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists savings_update_own on public.savings_transactions;
create policy savings_update_own
on public.savings_transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists savings_delete_own on public.savings_transactions;
create policy savings_delete_own
on public.savings_transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.incomes to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.savings_transactions to authenticated;
