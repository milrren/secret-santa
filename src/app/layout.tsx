import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secret Santa | Serverless Next.js",
  description:
    "Plataforma de Amigo Secreto otimizada para Serverless Functions e deploy na Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
