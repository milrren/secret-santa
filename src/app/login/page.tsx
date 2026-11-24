import { getSupabaseConfig } from "@/lib/supabase/config";
import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const { isConfigured } = getSupabaseConfig();

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <LoginForm
        redirectTo={params.redirectTo || "/dashboard"}
        isConfigured={isConfigured}
        callbackError={params.error === "auth_callback_error"}
      />
    </main>
  );
}
