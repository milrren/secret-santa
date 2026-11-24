import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { signOutAction } from "@/server/actions/auth-actions";
import { Calendar, Gift, KeyRound, LogOut, Sparkles, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Participante";

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
            <span>Sessão Autenticada (Supabase Auth)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Olá, {fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conectado como <span className="font-medium text-slate-700">{user.email}</span>
          </p>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Etapa 2 do Roadmap
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Sorteios que Criei
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Em breve você poderá criar sorteios com código cupom único (ex: SANTA-XXXX), definir data do evento, valor sugerido e gerenciar participantes.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aguardando implementação da Etapa 2</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Etapa 4 & 5 do Roadmap
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Sorteios que Participo
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Em breve você poderá consultar sorteios por código cupom, revelar quem você tirou e gerenciar sua lista de presentes com links.
          </p>
          <div className="inline-flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="inline-flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Código único
            </span>
            <span className="inline-flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              Wishlist rica
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
