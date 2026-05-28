import { supabase } from "@/lib/supabase/client";

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

export async function createSettlement(payload: {
  scenario_id: string;
  nation_id?: string | null;
  user_id: string;
  name: string;
  type?: string | null;
  description?: string | null;
  population?: number | null;
  government?: string | null;
  economy?: string | null;
  notable_places?: string | null;
}) {
  const { data, error } = await supabase
    .from("settlements")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Settlement;
}

export async function updateSettlement(
  id: string,
  payload: Partial<{
    name: string;
    type: string | null;
    description: string | null;
    population: number | null;
    government: string | null;
    economy: string | null;
    notable_places: string | null;
  }>
) {
  const { data, error } = await supabase
    .from("settlements")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Settlement;
}

export async function deleteSettlement(id: string) {
  const { error } = await supabase.from("settlements").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}
