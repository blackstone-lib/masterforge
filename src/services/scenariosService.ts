import { supabase } from "@/lib/supabase/client";

export type Scenario = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export async function getScenarioById(id: string) {
  const { data, error } = await supabase
    .from("scenarios")
    .select("id, user_id, name, description, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Scenario;
}
