create extension if not exists "pgcrypto";

create table if not exists public.factions (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  nation_id uuid references public.nations(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text,
  description text,
  goal text,
  leader text,
  allies text,
  enemies text,
  influence_level text,
  current_status text,
  master_secret text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.factions enable row level security;

create policy "Users can read their own factions"
  on public.factions
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own factions"
  on public.factions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own factions"
  on public.factions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own factions"
  on public.factions
  for delete
  using (auth.uid() = user_id);

create index if not exists factions_user_id_idx on public.factions(user_id);
create index if not exists factions_scenario_id_idx on public.factions(scenario_id);
create index if not exists factions_nation_id_idx on public.factions(nation_id);
create index if not exists factions_location_id_idx on public.factions(location_id);
create index if not exists factions_created_at_idx on public.factions(created_at desc);
