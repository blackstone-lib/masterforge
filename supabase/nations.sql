create extension if not exists "pgcrypto";

create table if not exists public.nations (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  government_type text,
  capital text,
  culture text,
  religion text,
  current_conflicts text,
  master_secret text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nations enable row level security;

create policy "Users can read their own nations"
  on public.nations
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own nations"
  on public.nations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own nations"
  on public.nations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own nations"
  on public.nations
  for delete
  using (auth.uid() = user_id);

create index if not exists nations_user_id_idx on public.nations(user_id);
create index if not exists nations_scenario_id_idx on public.nations(scenario_id);
create index if not exists nations_created_at_idx on public.nations(created_at desc);
