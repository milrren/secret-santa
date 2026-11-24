import Link from "next/link";
import { Gift, LogIn, LogOut, LayoutDashboard, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { signOutAction } from "@/server/actions/auth-actions";

export async function Navbar() {
  const { isConfigured } = getSupabaseConfig();
  let user = null;

  if (isConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-xs sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-slate-900 hover:text-red-600 transition-colors"
        >
          <span className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </span>
          <span className="text-lg tracking-tight">Secret Santa</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-red-600" />
                <span>Painel</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{displayName}</span>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
