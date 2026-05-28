import { supabase } from "../lib/supabase/client";

export type Settlement = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  user_id: string;
  name: string;
  type: string | null;
  description: string | null;
  population: number | null;
  government: string | null;
  economy: string | null;
  notable_places: string | null;
  created_at: string;
  updated_at: string;
};

export async function getSettlementsByScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from("settlements")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Settlement[];
}