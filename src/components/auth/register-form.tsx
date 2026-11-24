"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  registerAction,
  type AuthActionState,
} from "@/server/actions/auth-actions";
import { AlertCircle, CheckCircle2, Gift, Loader2, UserPlus } from "lucide-react";

interface RegisterFormProps {
  isConfigured: boolean;
}

export function RegisterForm({ isConfigured }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    registerAction,
    null
  );

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Gift className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Criar nova conta</h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize seus sorteios de Amigo Secreto e participe de grupos.
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>Supabase não configurado:</strong> adicione{" "}
            <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            e{" "}
            <code className="bg-amber-100 px-1 rounded">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            no <code className="bg-amber-100 px-1 rounded">.env.local</code>.
          </div>
        </div>
      )}

      {state?.error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.success}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Nome completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Maria Silva"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {state?.fieldErrors?.fullName && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@exemplo.com"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Mínimo de 6 caracteres"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Repita sua senha"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {state?.fieldErrors?.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Criando conta...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Já possui uma conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-red-600 hover:text-red-700 hover:underline"
        >
          Entrar agora
        </Link>
      </p>
    </div>
  );
}
