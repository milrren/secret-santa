export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url &&
      anonKey &&
      !url.includes("seu-projeto.supabase.co") &&
      !anonKey.includes("sua-chave-anon")
  );

  return {
    url: url || "https://placeholder.supabase.co",
    anonKey: anonKey || "placeholder-anon-key",
    isConfigured,
  };
}
