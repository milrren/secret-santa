-- Restringe execução da trigger function handle_new_user()
revoke execute on function public.handle_new_user() from public, anon, authenticated;
