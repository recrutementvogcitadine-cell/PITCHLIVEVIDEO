-- Table viewers pour compter les spectateurs en temps réel
create table if not exists public.viewers (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  user_id text not null,
  last_seen timestamp with time zone default timezone('utc', now())
);

create index if not exists idx_viewers_video_id on public.viewers(video_id);
create index if not exists idx_viewers_user_id on public.viewers(user_id);

-- RLS à activer :
-- 1. Activer RLS sur la table viewers
-- 2. Ajouter ces policies :
-- create policy "Allow anon insert" on public.viewers for insert using (true);
-- create policy "Allow anon update" on public.viewers for update using (true);
-- create policy "Allow anon select" on public.viewers for select using (true);
