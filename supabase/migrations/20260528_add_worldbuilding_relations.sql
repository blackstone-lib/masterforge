-- Fase 5: relações de worldbuilding do Master Forge
-- Rode este arquivo no SQL Editor do Supabase antes de ativar os campos no frontend.

begin;

-- Personagem -> Nação / Local / Facção
alter table public.characters
  add column if not exists nation_id uuid references public.nations(id) on delete set null,
  add column if not exists location_id uuid references public.locations(id) on delete set null,
  add column if not exists faction_id uuid references public.factions(id) on delete set null;

-- Evento -> Nação / Local / Personagem / Facção
alter table public.timeline_events
  add column if not exists nation_id uuid references public.nations(id) on delete set null,
  add column if not exists location_id uuid references public.locations(id) on delete set null,
  add column if not exists character_id uuid references public.characters(id) on delete set null,
  add column if not exists faction_id uuid references public.factions(id) on delete set null;

-- Lore -> Evento / Personagem / Local / Facção
alter table public.lore_entries
  add column if not exists event_id uuid references public.timeline_events(id) on delete set null,
  add column if not exists character_id uuid references public.characters(id) on delete set null,
  add column if not exists location_id uuid references public.locations(id) on delete set null,
  add column if not exists faction_id uuid references public.factions(id) on delete set null;

create index if not exists characters_nation_id_idx on public.characters(nation_id);
create index if not exists characters_location_id_idx on public.characters(location_id);
create index if not exists characters_faction_id_idx on public.characters(faction_id);

create index if not exists timeline_events_nation_id_idx on public.timeline_events(nation_id);
create index if not exists timeline_events_location_id_idx on public.timeline_events(location_id);
create index if not exists timeline_events_character_id_idx on public.timeline_events(character_id);
create index if not exists timeline_events_faction_id_idx on public.timeline_events(faction_id);

create index if not exists lore_entries_event_id_idx on public.lore_entries(event_id);
create index if not exists lore_entries_character_id_idx on public.lore_entries(character_id);
create index if not exists lore_entries_location_id_idx on public.lore_entries(location_id);
create index if not exists lore_entries_faction_id_idx on public.lore_entries(faction_id);

commit;
