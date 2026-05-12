"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { signOut } from "@/lib/session";
import { useFinance } from "@/lib/store";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/rendas", label: "Rendas" },
  { href: "/despesas", label: "Despesas" },
  { href: "/guardado", label: "Guardado" },
  { href: "/equilibrio", label: "Equilibrio" },
  { href: "/relatorios", label: "Relatorios" },
  { href: "/configuracoes", label: "Configuracoes" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      className={`rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-brand/20 text-brand border border-brand/30"
          : "text-muted hover:text-text hover:bg-white/5 border border-transparent"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const {
    state: { selectedMonth, users },
    sessionUserId,
    isLoading,
    setMonth,
  } = useFinance();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!sessionUserId) router.replace("/login");
  }, [router, sessionUserId, isLoading]);

  const currentUser = useMemo(
    () => users.find((user) => user.id === sessionUserId) ?? null,
    [sessionUserId, users],
  );

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-panel/60 p-6 lg:block">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">Custos Conjuntos</h1>
          <p className="mb-8 text-sm text-muted">Financas do casal em tempo real</p>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink href={item.href} key={item.href} label={item.label} />
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
            <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3 md:px-6 lg:px-8">
              <h1 className="mr-auto text-lg font-semibold lg:hidden">Custos Conjuntos</h1>
              <label className="text-xs text-muted">
                Mes
                <input
                  className="mt-1 block rounded-md border border-border bg-panel px-3 py-2 text-sm text-text"
                  onChange={(event) => setMonth(event.target.value)}
                  type="month"
                  value={selectedMonth}
                />
              </label>
              <div className="text-xs text-muted">
                Sessao
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md border border-border bg-panel px-3 py-2 text-sm text-text">
                    {currentUser?.nome ?? "Sem sessao"}
                  </span>
                  <button
                    className="rounded-md border border-border bg-panel px-3 py-2 text-sm text-muted transition hover:text-text"
                    onClick={() => void handleLogout()}
                    type="button"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
            <nav className="no-scrollbar overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
              <div className="flex min-w-max gap-2">
                {navItems.map((item) => (
                  <NavLink href={item.href} key={item.href} label={item.label} />
                ))}
              </div>
            </nav>
          </header>

          <main className="w-full flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <section className="rounded-xl2 border border-border bg-panel p-4 shadow-soft xl:p-5">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
