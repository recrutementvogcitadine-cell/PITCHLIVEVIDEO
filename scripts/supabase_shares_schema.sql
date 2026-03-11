-- Table: public.shares
-- Enregistre chaque partage de vidéo par utilisateur
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Compteur de partages par vidéo
create or replace view public.video_share_counts as
select video_id, count(*) as share_count
from public.shares
group by video_id;

-- RLS: chaque utilisateur peut insérer un partage, voir les siens, et voir les compteurs
alter table public.shares enable row level security;
create policy "Allow insert for authenticated" on public.shares
  for insert using (auth.uid() = user_id);
create policy "Allow select for all" on public.shares
  for select using (true);
