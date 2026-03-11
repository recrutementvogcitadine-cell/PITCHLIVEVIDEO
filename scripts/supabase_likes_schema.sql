-- Table likes pour persistance des likes par vidéo et utilisateur
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create index if not exists idx_likes_video_id on public.likes(video_id);
create index if not exists idx_likes_user_id on public.likes(user_id);

-- RLS à activer :
-- 1. Activer RLS sur la table likes
-- 2. Ajouter ces policies :
-- create policy "Allow anon insert" on public.likes for insert using (true);
-- create policy "Allow anon delete" on public.likes for delete using (true);
-- create policy "Allow anon select" on public.likes for select using (true);
