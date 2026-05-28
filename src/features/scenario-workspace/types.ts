export type Scenario = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ActiveSection =
  | "overview"
  | "nations"
  | "settlements"
  | "locations"
  | "factions"
  | "characters"
  | "timeline_events"
  | "lore_entries";

export type EntitySection = Exclude<ActiveSection, "overview">;
export type EditorMode = "scenario" | "entity-create" | "entity-edit" | null;

export type RelationKey = "nation_id" | "location_id";

export type EntityRecord = Record<string, unknown> & {
  id: string;
  scenario_id?: string;
  name?: string | null;
  title?: string | null;
  type?: string | null;
  category?: string | null;
  event_type?: string | null;
  nation_id?: string | null;
  location_id?: string | null;
};

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number";
  placeholder?: string;
  required?: boolean;
  inputType?: string;
  options?: string[];
  section?: string;
  priority?: number;
};

export type SectionConfig = {
  id: EntitySection;
  label: string;
  table: string;
  titleField: "name" | "title";
  createLabel: string;
  emptyTitle: string;
  emptyText: string;
  fields: FieldConfig[];
  relations?: RelationKey[];
  selectFields: string;
};

export type EntityRows = Record<EntitySection, EntityRecord[]>;
