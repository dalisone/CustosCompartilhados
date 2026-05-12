import type { Metadata } from "next";
import "./globals.css";
import { FinanceProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Custos Conjuntos",
  description: "Controle financeiro conjunto para casal em PT-BR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <FinanceProvider>{children}</FinanceProvider>
      </body>
    </html>
  );
}
