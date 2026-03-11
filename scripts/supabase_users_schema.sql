-- Table users pour inscription visiteurs
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  phone text not null,
  password text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Index pour recherche rapide
create index if not exists idx_users_username on public.users(username);

-- RLS à activer :
-- 1. Activer RLS sur la table users
-- 2. Ajouter ces policies :
-- create policy "Allow anon insert" on public.users for insert using (true);
-- create policy "Allow anon select" on public.users for select using (true);
