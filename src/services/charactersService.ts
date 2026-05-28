import { supabase } from "@/lib/supabase/client";

export type Character = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  settlement_id: string | null;
  faction_id: string | null;
  user_id: string;
  name: string;
  title: string | null;
  type: string | null;
  race: string | null;
  class_role: string | null;
  description: string | null;
  personality: string | null;
  background: string | null;
  motivation: string | null;
  goals: string | null;
  secrets: string | null;
  faction_role: string | null;
  current_status: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCharactersByScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Character[];
}
