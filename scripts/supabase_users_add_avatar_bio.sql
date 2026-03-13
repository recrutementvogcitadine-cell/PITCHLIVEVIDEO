-- Migration : Ajout avatar_url et bio à la table users
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists bio text;