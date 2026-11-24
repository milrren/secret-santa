import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { CreateDrawForm } from "@/components/draws/create-draw-form";

export const dynamic = "force-dynamic";

export default async function NewDrawPage() {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userFullName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Organizador";

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Painel</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Criar Novo Sorteio
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure as informações do amigo secreto e adicione os participantes.
        </p>
      </div>

      <CreateDrawForm
        userFullName={userFullName}
        userEmail={user.email || ""}
      />
    </main>
  );
}
