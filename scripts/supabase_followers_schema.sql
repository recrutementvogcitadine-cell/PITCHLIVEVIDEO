-- Table: public.followers
-- Suivi entre utilisateurs (TikTok-like)

create table if not exists public.followers (
  id uuid primary key default gen_random_uuid(),
  follower_id text not null, -- pseudo ou id utilisateur qui suit
  followed_id text not null, -- pseudo ou id utilisateur suivi
  created_at timestamp with time zone default now(),
  constraint unique_follow unique (follower_id, followed_id)
);

-- Index pour requêtes rapides
create index if not exists idx_followers_follower on public.followers (follower_id);
create index if not exists idx_followers_followed on public.followers (followed_id);
