-- Secret Santa: Schema inicial completo (Etapa 1)
-- Aplicado via Supabase MCP / Migrations.

-- Schema privado (não exposto via Data API) para helpers SECURITY DEFINER
create schema if not exists private;

-- 1. Tabela de Perfis (sincronizada com auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabela de Sorteios (Eventos)
create table if not exists public.draws (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  title text not null,
  description text,
  event_date timestamptz,
  budget_limit numeric(10, 2),
  status text not null default 'draft' check (status in ('draft', 'drawn', 'completed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_draws_code on public.draws (code);
create index if not exists idx_draws_created_by on public.draws (created_by);

-- 3. Tabela de Participantes
create table if not exists public.participants (
  id uuid default gen_random_uuid() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  name text not null,
  email text not null,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_participants_draw_id on public.participants (draw_id);
create index if not exists idx_participants_user_id on public.participants (user_id);
create index if not exists idx_participants_email on public.participants (lower(email));
create unique index if not exists idx_participants_draw_email_unique
  on public.participants (draw_id, lower(email));

-- 4. Tabela de Resultados do Sorteio (Matches)
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  giver_id uuid references public.participants(id) on delete cascade not null,
  receiver_id uuid references public.participants(id) on delete cascade not null,
  email_sent boolean not null default false,
  created_at timestamptz not null default now(),
  constraint matches_no_self_draw check (giver_id <> receiver_id),
  unique (draw_id, giver_id),
  unique (draw_id, receiver_id)
);

create index if not exists idx_matches_draw_id on public.matches (draw_id);
create index if not exists idx_matches_giver_id on public.matches (giver_id);
create index if not exists idx_matches_receiver_id on public.matches (receiver_id);

-- 5. Tabela de Lista de Presentes (Wishlist)
create table if not exists public.wishlist_items (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references public.participants(id) on delete cascade not null,
  title text not null,
  url text,
  price numeric(10, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wishlist_participant_id on public.wishlist_items (participant_id);

-- ============================================================================
-- Triggers e Funções Auxiliares
-- ============================================================================

-- Atualiza updated_at automaticamente (com search_path fixo)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace trigger trg_draws_updated_at
  before update on public.draws
  for each row execute function public.set_updated_at();

create or replace trigger trg_wishlist_updated_at
  before update on public.wishlist_items
  for each row execute function public.set_updated_at();

-- Cria perfil automaticamente no cadastro e vincula convites pendentes por email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);

  -- Vincula automaticamente participantes convidados previamente pelo mesmo e-mail
  update public.participants
  set user_id = new.id
  where lower(email) = lower(new.email)
    and user_id is null;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Funções SECURITY DEFINER em schema privado para evitar recursão em RLS
create or replace function private.is_draw_creator(p_draw_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.draws
    where id = p_draw_id
      and created_by = (select auth.uid())
  );
$$;

create or replace function private.is_draw_participant(p_draw_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.participants
    where draw_id = p_draw_id
      and (
        user_id = (select auth.uid())
        or lower(email) = lower(coalesce((select auth.jwt())->>'email', ''))
      )
  );
$$;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.draws enable row level security;
alter table public.participants enable row level security;
alter table public.matches enable row level security;
alter table public.wishlist_items enable row level security;

-- PROFILES
create policy "Usuário visualiza apenas o próprio perfil"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Usuário atualiza apenas o próprio perfil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- DRAWS
create policy "Criador gerencia próprios sorteios"
  on public.draws for all
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy "Participantes visualizam sorteios que participam"
  on public.draws for select
  to authenticated
  using (private.is_draw_participant(id));

-- PARTICIPANTS
create policy "Criador gerencia participantes do sorteio"
  on public.participants for all
  to authenticated
  using (private.is_draw_creator(draw_id))
  with check (private.is_draw_creator(draw_id));

create policy "Participantes veem lista do sorteio"
  on public.participants for select
  to authenticated
  using (private.is_draw_participant(draw_id));

-- MATCHES (Privacidade estrita: ninguém além do próprio tirador lê seu par)
create policy "Participante visualiza apenas quem ele mesmo tirou"
  on public.matches for select
  to authenticated
  using (
    exists (
      select 1 from public.participants p
      where p.id = matches.giver_id
        and (
          p.user_id = (select auth.uid())
          or lower(p.email) = lower(coalesce((select auth.jwt())->>'email', ''))
        )
    )
  );

create policy "Criador insere resultados no momento do sorteio"
  on public.matches for insert
  to authenticated
  with check (private.is_draw_creator(draw_id));

create policy "Criador atualiza status de envio de email"
  on public.matches for update
  to authenticated
  using (private.is_draw_creator(draw_id))
  with check (private.is_draw_creator(draw_id));

-- WISHLIST ITEMS
create policy "Participante gerencia sua própria wishlist"
  on public.wishlist_items for all
  to authenticated
  using (
    exists (
      select 1 from public.participants p
      where p.id = wishlist_items.participant_id
        and (
          p.user_id = (select auth.uid())
          or lower(p.email) = lower(coalesce((select auth.jwt())->>'email', ''))
        )
    )
  )
  with check (
    exists (
      select 1 from public.participants p
      where p.id = wishlist_items.participant_id
        and (
          p.user_id = (select auth.uid())
          or lower(p.email) = lower(coalesce((select auth.jwt())->>'email', ''))
        )
    )
  );

create policy "Amigo secreto visualiza wishlist de quem tirou"
  on public.wishlist_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.matches m
      join public.participants giver on giver.id = m.giver_id
      where m.receiver_id = wishlist_items.participant_id
        and (
          giver.user_id = (select auth.uid())
          or lower(giver.email) = lower(coalesce((select auth.jwt())->>'email', ''))
        )
    )
  );
