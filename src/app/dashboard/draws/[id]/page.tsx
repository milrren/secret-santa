import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { ManageDrawClient } from "@/components/draws/manage-draw-client";

export const dynamic = "force-dynamic";

interface ManageDrawPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageDrawPage({ params }: ManageDrawPageProps) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!draw) {
    notFound();
  }

  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("draw_id", draw.id)
    .order("created_at", { ascending: true });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Meus Sorteios</span>
        </Link>
      </div>

      <ManageDrawClient draw={draw} participants={participants ?? []} />
    </main>
  );
}
