import { supabase } from "@/lib/supabase/client";
import { sectionConfigs } from "./section-config";
import type {
  EntityRecord,
  EntityRows,
  EntitySection,
  Scenario,
  SectionConfig,
} from "./types";

function getErrorMessage(error: unknown) {
  if (!error) return "";

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Erro inesperado ao acessar os dados da Forja.";
}

export function emptyRows(): EntityRows {
  return {
    nations: [],
    settlements: [],
    locations: [],
    factions: [],
    characters: [],
    timeline_events: [],
    lore_entries: [],
  };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();

  return data.user;
}

export async function getScenarioForUser(scenarioId: string, userId: string) {
  return supabase
    .from("scenarios")
    .select("id, user_id, name, description, created_at, updated_at")
    .eq("id", scenarioId)
    .eq("user_id", userId)
    .single<Scenario>();
}

export async function getScenarioEntities(scenarioId: string) {
  const nextRows = emptyRows();

  const results = await Promise.all(
    (Object.keys(sectionConfigs) as EntitySection[]).map(async (section) => {
      const config = sectionConfigs[section];

      const result = await supabase
        .from(config.table)
        .select(config.selectFields)
        .eq("scenario_id", scenarioId)
        .order("created_at", { ascending: false });

      return { section, config, result };
    })
  );

  let firstError = "";

  for (const { section, config, result } of results) {
    nextRows[section] = (result.data ?? []) as EntityRecord[];

    if (!firstError && result.error) {
      firstError = `Não foi possível carregar ${config.label}: ${getErrorMessage(
        result.error
      )}`;
    }
  }

  return {
    rows: nextRows,
    error: firstError,
  };
}

export async function updateScenario(
  scenario: Scenario,
  name: string,
  description: string
) {
  return supabase
    .from("scenarios")
    .update({
      name: name.trim(),
      description: description.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", scenario.id)
    .eq("user_id", scenario.user_id)
    .select("id, user_id, name, description, created_at, updated_at")
    .single<Scenario>();
}

export async function createEntity(
  config: SectionConfig,
  scenarioId: string,
  payload: Record<string, string | null>
) {
  return supabase
    .from(config.table)
    .insert({
      scenario_id: scenarioId,
      ...payload,
    })
    .select(config.selectFields)
    .single<EntityRecord>();
}

export async function updateEntity(
  config: SectionConfig,
  scenarioId: string,
  entityId: string,
  payload: Record<string, string | null>
) {
  return supabase
    .from(config.table)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", entityId)
    .eq("scenario_id", scenarioId)
    .select(config.selectFields)
    .single<EntityRecord>();
}

export async function deleteEntityRecord(
  config: SectionConfig,
  scenarioId: string,
  entityId: string
) {
  return supabase
    .from(config.table)
    .delete()
    .eq("id", entityId)
    .eq("scenario_id", scenarioId);
}