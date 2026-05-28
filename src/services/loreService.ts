import { supabase } from "@/lib/supabase/client";

export type LoreEntry = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  settlement_id: string | null;
  faction_id: string | null;
  character_id: string | null;
  location_id: string | null;
  timeline_event_id: string | null;
  user_id: string;
  title: string;
  category: string | null;
  summary: string | null;
  content: string | null;
  origin: string | null;
  importance: string | null;
  related_entities: string | null;
  secrets: string | null;
  rumors: string | null;
  contradictions: string | null;
  adventure_hooks: string | null;
  master_notes: string | null;
  tags: string | null;
  status: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export async function getLoreEntriesByScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from("lore_entries")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as LoreEntry[];
}
