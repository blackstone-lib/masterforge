import { relationLabels } from "./section-config";
import type { EntityRecord, EntityRows, FieldConfig, RelationKey, SectionConfig } from "./types";

export function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "Não definido";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

export function titleOf(item: EntityRecord, config: SectionConfig) {
  return item[config.titleField] || item.name || item.title || "Registro sem nome";
}

export function relationOptions(rows: EntityRows, relation: RelationKey) {
  if (relation === "nation_id") return rows.nations.map((item) => ({ id: item.id, label: String(item.name ?? "Nação sem nome") }));
  if (relation === "location_id") return rows.locations.map((item) => ({ id: item.id, label: String(item.name ?? "Local sem nome") }));
  if (relation === "faction_id") return rows.factions.map((item) => ({ id: item.id, label: String(item.name ?? "Facção sem nome") }));
  if (relation === "character_id") return rows.characters.map((item) => ({ id: item.id, label: String(item.name ?? "Personagem sem nome") }));
  return rows.timeline_events.map((item) => ({ id: item.id, label: String(item.title ?? "Evento sem título") }));
}

export function relationName(rows: EntityRows, relation: RelationKey, value: unknown) {
  if (!value) return "";
  const option = relationOptions(rows, relation).find((item) => item.id === value);
  return option?.label ?? relationLabels[relation];
}

export function filledFields(item: EntityRecord, config: SectionConfig) {
  return config.fields
    .filter((field) => hasValue(item[field.key]))
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
}

export function groupedFields(fields: FieldConfig[]) {
  return fields.reduce<Array<{ title: string; fields: FieldConfig[] }>>((groups, field) => {
    const title = field.section ?? "Informações";
    const current = groups.find((group) => group.title === title);

    if (current) current.fields.push(field);
    else groups.push({ title, fields: [field] });

    return groups;
  }, []);
}

export function buildInitialData(config: SectionConfig, item?: EntityRecord, extra?: Record<string, string>) {
  const data: Record<string, string> = {};

  for (const field of config.fields) {
    const value = item?.[field.key];
    data[field.key] = item ? valueText(value) === "Não definido" ? "" : valueText(value) : "";
  }

  for (const relation of config.relations ?? []) {
    data[relation] = item ? String(item[relation] ?? "") : "";
  }

  return { ...data, ...(extra ?? {}) };
}

export function buildPayloadFromForm(config: SectionConfig, formData: Record<string, string>) {
  const payload: Record<string, string | null> = {};

  for (const field of config.fields) payload[field.key] = formData[field.key]?.trim() ?? "";
  for (const relation of config.relations ?? []) payload[relation] = formData[relation] || null;

  return payload;
}
