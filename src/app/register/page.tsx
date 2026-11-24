import { getSupabaseConfig } from "@/lib/supabase/config";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const { isConfigured } = getSupabaseConfig();

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <RegisterForm isConfigured={isConfigured} />
    </main>
  );
}
