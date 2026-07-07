-- Normalizacao de categorias das despesas.
-- Execute no Supabase SQL Editor (roda como postgres, ignora RLS,
-- entao atualiza os lancamentos de todos os usuarios de uma vez).

-- 1) Move o lancamento "Cartão de crédito" da categoria Geral para "Cartão".
--    O "_" no padrao casa tanto a grafia com acento quanto sem.
update public.expenses
set categoria = 'Cartão'
where lower(trim(categoria)) = 'geral'
  and titulo ilike '%cart_o de cr_dito%';

-- 2) Unifica grafias da mesma categoria (ex.: "Lazer" e "lazer").
--    Para cada grupo case-insensitive, escolhe como grafia canonica a
--    variante que comeca com maiuscula e, em empate, a mais usada.
with canonical as (
  select distinct on (lower(trim(categoria)))
    lower(trim(categoria)) as chave,
    trim(categoria) as rotulo
  from public.expenses
  group by trim(categoria)
  order by
    lower(trim(categoria)),
    (trim(categoria) ~ '^[[:upper:]]') desc,
    count(*) desc
)
update public.expenses e
set categoria = c.rotulo
from canonical c
where lower(trim(e.categoria)) = c.chave
  and e.categoria is distinct from c.rotulo;

-- 3) Conferencia: deve listar cada categoria uma unica vez, sem duplicatas
--    de maiusculas/minusculas.
select categoria, count(*) as lancamentos
from public.expenses
group by categoria
order by categoria;
