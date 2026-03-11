-- Schéma SQL pour la table messages (à exécuter dans Supabase SQL Editor)

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  creator text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Index pour accélérer les requêtes par vidéo
create index if not exists idx_messages_video_id on public.messages(video_id);

-- Règle de sécurité (RLS) à activer dans Supabase :
-- 1. Activer RLS sur la table messages
-- 2. Ajouter cette policy pour autoriser l'insert et le select anonymes :
--
-- allow insert/select for anon
--
-- create policy "Allow anon insert" on public.messages
--   for insert using (true);
-- create policy "Allow anon select" on public.messages
--   for select using (true);
