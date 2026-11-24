import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { CopyCodeButton } from "@/components/draws/copy-code-button";
import { DrawStatusBadge } from "@/components/draws/draw-status-badge";
import {
  ArrowRight,
  Calendar,
  Coins,
  Gift,
  KeyRound,
  Plus,
  Users,
} from "lucide-react";

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

  // Busca sorteios criados pelo usuário com contagem de participantes
  const { data: createdDraws } = await supabase
    .from("draws")
    .select(
      "id, code, title, description, event_date, budget_limit, status, created_at, participants(count)"
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  // Contagem simples de sorteios onde o usuário é participante (para prévia da Etapa 4)
  const { count: participatingCount } = user.email
    ? await supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .or(`user_id.eq.${user.id},email.ilike."${user.email}"`)
    : await supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

  const drawsList = createdDraws ?? [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header do Painel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
            <span>Painel do Organizador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Olá, {fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conectado como{" "}
            <span className="font-medium text-slate-700">{user.email}</span>
          </p>
        </div>

        <Link
          href="/dashboard/draws/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Sorteio</span>
        </Link>
      </div>

      {/* Sorteios Criados */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Sorteios que Criei ({drawsList.length})
          </h2>
        </div>

        {drawsList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Nenhum sorteio criado ainda
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
              Crie seu primeiro Amigo Secreto, gere um código cupom único e convide seus amigos ou colegas.
            </p>
            <Link
              href="/dashboard/draws/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeiro Sorteio</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {drawsList.map((draw) => {
              const participantCount =
                Array.isArray(draw.participants) && draw.participants[0]
                  ? draw.participants[0].count
                  : 0;

              return (
                <div
                  key={draw.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between gap-5 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <DrawStatusBadge status={draw.status} />
                      <CopyCodeButton code={draw.code} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                        {draw.title}
                      </h3>
                      {draw.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {draw.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-600">
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {formatDateBR(draw.event_date)}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatCurrencyBRL(draw.budget_limit)}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 col-span-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {participantCount}{" "}
                          {participantCount === 1
                            ? "participante"
                            : "participantes"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/dashboard/draws/${draw.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      <span>Gerenciar Sorteio</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Prévia da Área do Participante (Etapa 4) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Sorteios que Participo ({participatingCount ?? 0})
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Etapa 4 & 5
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Em breve você poderá consultar sorteios por código cupom, revelar quem você tirou e cadastrar sua lista de presentes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
