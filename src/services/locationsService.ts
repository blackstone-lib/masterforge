import { supabase } from "@/lib/supabase/client";

export type Location = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  settlement_id: string | null;
  faction_id: string | null;
  user_id: string;
  name: string;
  type: string | null;
  description: string | null;
  population: string | null;
  ruler: string | null;
  importance: string | null;
  current_situation: string | null;
  master_secret: string | null;
  history: string | null;
  secrets: string | null;
  dangers: string | null;
  rumors: string | null;
  adventure_hooks: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

export async function getLocationsByScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Location[];
}
