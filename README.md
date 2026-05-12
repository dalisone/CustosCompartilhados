# Custos Conjuntos

Aplicacao web em PT-BR para controle financeiro conjunto de casal (desktop + iOS via navegador), com autenticação e banco compartilhado no Supabase.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase:
  - Auth (sessao/login)
  - PostgreSQL (dados compartilhados)
  - RLS (cada perfil edita apenas seus proprios lancamentos)
- Deploy recomendado: Vercel

## Funcionalidades

- Login com sessao
- Visualizacao compartilhada dos dados do casal
- Restricao por perfil:
  - cada usuario cria/edita/remove somente os proprios lancamentos
- Dashboard financeiro mensal
- Rendas (mensal/unica)
- Despesas (mensal/unica), categoria, fonte e parcelas
- Guardado (deposito/resgate)
- Compensacao automatica entre perfis
- Relatorios por categoria

## Regras principais

- Toda renda e contextualizada de forma conjunta, com dono de origem.
- Toda despesa tem responsavel.
- Saldo individual: `renda individual - despesas individuais`.
- Quando saldo individual fica negativo, o sistema sugere compensacao de quem ficou positivo.
- Guardado: `depositos - resgates`.
- Despesa recorrente com parcelas encerra automaticamente ao final.

---

## 1) Rodar localmente

```bash
npm install
npm run dev
```

Abra: `http://localhost:3000`

Crie um arquivo `.env.local` na raiz com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

---

## 2) Configurar Supabase

### 2.1 Criar projeto

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto
3. Copie:
   - `Project URL`
   - `anon public key`

### 2.2 Criar schema e politicas

1. Abra o SQL Editor no projeto Supabase
2. Copie e execute o script:
   - [supabase/schema.sql](C:\Users\Alison\Desktop\projetos\CustosConjuntos\supabase\schema.sql)

Esse script cria:

- `profiles`
- `incomes`
- `expenses`
- `savings_transactions`
- trigger para criar perfil automaticamente ao cadastrar usuario no Auth
- RLS com regra:
  - leitura compartilhada para usuarios autenticados
  - escrita somente no proprio registro

### 2.3 Criar os dois usuarios (casal)

1. No Supabase: `Authentication` -> `Users`
2. Clique em `Add user`
3. Crie um usuario para cada email (ex.: voce e sua esposa)
4. Defina senha para ambos

Pronto: o perfil em `profiles` sera criado automaticamente pelo trigger.

---

## 3) Deploy na Vercel (URL fixa)

### 3.1 Subir o codigo para GitHub

1. Crie um repositório no GitHub
2. Envie este projeto para o repositório

### 3.2 Importar na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. `Add New` -> `Project`
3. Selecione o repositorio
4. Em `Environment Variables`, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em `Deploy`

Ao final, a Vercel gera URL fixa no formato:

- `https://seu-projeto.vercel.app`

### 3.3 (Opcional) dominio proprio

Na Vercel:

1. Abra o projeto -> `Settings` -> `Domains`
2. Conecte seu dominio (ex.: `financas-casal.com.br`)

---

## 4) Permissoes de negocio no app

- Sem login: telas internas bloqueadas.
- Com login: visualiza dados do casal.
- Com login: so consegue alterar lancamentos cujo `user_id` e o proprio.

---

## Referencias oficiais

- Supabase JS: [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- Supabase Auth: [Auth Overview](https://supabase.com/docs/guides/auth)
- Supabase RLS: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Vercel Deploy: [Deploying Next.js](https://vercel.com/docs/frameworks/nextjs)
- Vercel Env Vars: [Environment Variables](https://vercel.com/docs/environment-variables)

