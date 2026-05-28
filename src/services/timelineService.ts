import { supabase } from "@/lib/supabase/client";

export type TimelineEvent = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  settlement_id: string | null;
  faction_id: string | null;
  character_id: string | null;
  location_id: string | null;
  user_id: string;
  title: string;
  event_type: string | null;
  description: string | null;
  era: string | null;
  year: string | null;
  month: string | null;
  day: string | null;
  date_label: string | null;
  causes: string | null;
  consequences: string | null;
  involved_parties: string | null;
  outcome: string | null;
  secrets: string | null;
  rumors: string | null;
  importance: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getTimelineEventsByScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("year", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data as TimelineEvent[];
}
