create extension if not exists "pgcrypto";

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  nation_id uuid references public.nations(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text,
  description text,
  population text,
  ruler text,
  importance text,
  current_situation text,
  master_secret text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.locations enable row level security;

create policy "Users can read their own locations"
  on public.locations
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own locations"
  on public.locations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own locations"
  on public.locations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own locations"
  on public.locations
  for delete
  using (auth.uid() = user_id);

create index if not exists locations_user_id_idx on public.locations(user_id);
create index if not exists locations_scenario_id_idx on public.locations(scenario_id);
create index if not exists locations_nation_id_idx on public.locations(nation_id);
create index if not exists locations_created_at_idx on public.locations(created_at desc);
