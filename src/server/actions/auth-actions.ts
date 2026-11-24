"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { LoginSchema, RegisterSchema } from "@/server/schemas/auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
} | null;

function sanitizeRedirectPath(rawPath: FormDataEntryValue | null): string {
  if (typeof rawPath !== "string") return "/dashboard";
  if (!rawPath.startsWith("/") || rawPath.startsWith("//")) return "/dashboard";
  return rawPath;
}

function mapSupabaseAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de acessar sua conta.";
  }
  if (normalized.includes("user already registered")) {
    return "Já existe uma conta cadastrada com este e-mail.";
  }
  if (normalized.includes("password should be at least")) {
    return "A senha deve ter no mínimo 6 caracteres.";
  }
  return message;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      error:
        "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.",
    };
  }

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapSupabaseAuthError(error.message) };
  }

  const redirectTo = sanitizeRedirectPath(formData.get("redirectTo"));
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      error:
        "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.",
    };
  }

  const parsed = RegisterSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: mapSupabaseAuthError(error.message) };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    success:
      "Cadastro realizado! Verifique sua caixa de entrada para confirmar seu e-mail antes de entrar.",
  };
}

export async function signOutAction(): Promise<void> {
  const { isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
