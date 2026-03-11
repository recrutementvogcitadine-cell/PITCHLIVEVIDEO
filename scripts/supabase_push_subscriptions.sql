-- Table pour stocker les abonnements push des utilisateurs
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.push_subscriptions enable row level security;
create policy "Allow insert for all" on public.push_subscriptions for insert with check (true);
create policy "Allow select for all" on public.push_subscriptions for select using (true);
