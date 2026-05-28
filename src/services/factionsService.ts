import { supabase } from "@/lib/supabase/client";

export type Faction = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  location_id: string | null;
  user_id: string;
  name: string;
  type: string | null;
  description: string | null;
  leader: string | null;
  influence_level: string | null;
  current_status: string | null;
  goal: string | null;
  goals: string | null;
  allies: string | null;
  enemies: string | null;
  master_secret: string | null;
  created_at: string;
  updated_at: string;
};

export async function getFactionsByScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Faction[];
}
