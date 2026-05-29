import type { ActiveSection, EntitySection, FieldConfig, RelationKey, SectionConfig } from "./types";

const field = (config: FieldConfig): FieldConfig => config;

export const relationLabels: Record<RelationKey, string> = {
  nation_id: "Nação vinculada",
  location_id: "Local vinculado",
  faction_id: "Facção vinculada",
  character_id: "Personagem vinculado",
  event_id: "Evento vinculado"
};

export const sectionConfigs: Record<EntitySection, SectionConfig> = {
  nations: {
    id: "nations",
    label: "Nações",
    table: "nations",
    titleField: "name",
    createLabel: "Fundar nação",
    emptyTitle: "Nenhuma bandeira foi erguida.",
    emptyText: "Crie a primeira nação deste cenário para organizar política, cultura e conflitos.",
    selectFields: "id, scenario_id, name, description, government_type, capital, culture, religion, current_conflicts, master_secret, created_at, updated_at",
    fields: [
      field({ key: "name", label: "Nome", required: true, placeholder: "Reino Áureo", priority: 1 }),
      field({ key: "description", label: "Descrição", type: "textarea", section: "Identidade", priority: 2 }),
      field({ key: "government_type", label: "Tipo de governo", placeholder: "Monarquia, república, teocracia...", priority: 3 }),
      field({ key: "capital", label: "Capital", priority: 4 }),
      field({ key: "culture", label: "Cultura", type: "textarea" }),
      field({ key: "religion", label: "Religião", type: "textarea" }),
      field({ key: "current_conflicts", label: "Conflitos atuais", type: "textarea" }),
      field({ key: "master_secret", label: "Segredo do mestre", type: "textarea", section: "Segredos" })
    ]
  },
  settlements: {
    id: "settlements",
    label: "Assentamentos",
    table: "settlements",
    titleField: "name",
    createLabel: "Criar assentamento",
    emptyTitle: "Nenhum assentamento registrado.",
    emptyText: "Cidades, vilas, capitais e povoados aparecerão aqui.",
    selectFields: "id, scenario_id, nation_id, name, type, description, population, government, economy, notable_places, created_at, updated_at",
    relations: ["nation_id"],
    fields: [
      field({ key: "name", label: "Nome", required: true, priority: 1 }),
      field({ key: "type", label: "Tipo", type: "select", options: ["Vila", "Cidade", "Capital", "Fortaleza", "Porto", "Ruína habitada"], priority: 2 }),
      field({ key: "description", label: "Descrição", type: "textarea", priority: 3 }),
      field({ key: "population", label: "População", inputType: "number", priority: 4 }),
      field({ key: "government", label: "Governo" }),
      field({ key: "economy", label: "Economia", type: "textarea" }),
      field({ key: "notable_places", label: "Pontos notáveis", type: "textarea" })
    ]
  },
  locations: {
    id: "locations",
    label: "Locais",
    table: "locations",
    titleField: "name",
    createLabel: "Registrar local",
    emptyTitle: "O mapa ainda está em branco.",
    emptyText: "Registre templos, fortalezas, ruínas, cidades especiais e pontos de interesse.",
    selectFields: "id, scenario_id, nation_id, name, type, description, population, ruler, importance, current_situation, master_secret, created_at, updated_at",
    relations: ["nation_id"],
    fields: [
      field({ key: "name", label: "Nome", required: true, priority: 1 }),
      field({ key: "type", label: "Tipo", type: "select", options: ["Templo", "Fortaleza", "Ruína", "Floresta", "Montanha", "Cidade especial", "Ponto de interesse"], priority: 2 }),
      field({ key: "description", label: "Descrição", type: "textarea", priority: 3 }),
      field({ key: "population", label: "População", inputType: "number" }),
      field({ key: "ruler", label: "Governante" }),
      field({ key: "importance", label: "Importância", type: "textarea" }),
      field({ key: "current_situation", label: "Situação atual", type: "textarea" }),
      field({ key: "master_secret", label: "Segredo do mestre", type: "textarea" })
    ]
  },
  factions: {
    id: "factions",
    label: "Facções",
    table: "factions",
    titleField: "name",
    createLabel: "Criar facção",
    emptyTitle: "Nenhuma sombra se move ainda.",
    emptyText: "Crie guildas, cultos, ordens, casas nobres e sociedades secretas.",
    selectFields: "id, scenario_id, nation_id, location_id, name, type, description, goal, leader, allies, enemies, influence_level, current_status, master_secret, created_at, updated_at",
    relations: ["nation_id", "location_id"],
    fields: [
      field({ key: "name", label: "Nome", required: true, priority: 1 }),
      field({ key: "type", label: "Tipo", type: "select", options: ["Guilda", "Culto", "Ordem", "Casa nobre", "Sociedade secreta", "Milícia", "Clã"], priority: 2 }),
      field({ key: "description", label: "Descrição", type: "textarea", priority: 3 }),
      field({ key: "goal", label: "Objetivo", type: "textarea", priority: 4 }),
      field({ key: "leader", label: "Líder" }),
      field({ key: "allies", label: "Aliados", type: "textarea" }),
      field({ key: "enemies", label: "Inimigos", type: "textarea" }),
      field({ key: "influence_level", label: "Influência", type: "select", options: ["Local", "Regional", "Nacional", "Continental"] }),
      field({ key: "current_status", label: "Status atual" }),
      field({ key: "master_secret", label: "Segredo do mestre", type: "textarea" })
    ]
  },
  characters: {
    id: "characters",
    label: "Personagens",
    table: "characters",
    titleField: "name",
    createLabel: "Criar personagem",
    emptyTitle: "Nenhum personagem registrado.",
    emptyText: "Crie NPCs, aliados, antagonistas e figuras importantes do cenário.",
    selectFields: "id, scenario_id, nation_id, location_id, faction_id, name, title, type, race, class_role, description, personality, background, goals, secrets, created_at, updated_at",
    relations: ["nation_id", "location_id", "faction_id"],
    fields: [
      field({ key: "name", label: "Nome", required: true, priority: 1 }),
      field({ key: "title", label: "Título", priority: 2 }),
      field({ key: "type", label: "Tipo", type: "select", options: ["Aliado", "Antagonista", "Neutro", "Patrono", "Informante", "Vilão"], priority: 3 }),
      field({ key: "race", label: "Raça" }),
      field({ key: "class_role", label: "Função" }),
      field({ key: "description", label: "Descrição", type: "textarea" }),
      field({ key: "personality", label: "Personalidade", type: "textarea" }),
      field({ key: "background", label: "Histórico", type: "textarea" }),
      field({ key: "goals", label: "Objetivos", type: "textarea" }),
      field({ key: "secrets", label: "Segredos", type: "textarea" })
    ]
  },
  timeline_events: {
    id: "timeline_events",
    label: "Linha do tempo",
    table: "timeline_events",
    titleField: "title",
    createLabel: "Criar evento",
    emptyTitle: "Nenhum evento histórico registrado.",
    emptyText: "Registre eras, guerras, rituais, catástrofes e consequências do mundo.",
    selectFields: "id, scenario_id, nation_id, location_id, character_id, faction_id, title, event_type, date_label, era, year, description, causes, consequences, outcome, secrets, created_at, updated_at",
    relations: ["nation_id", "location_id", "character_id", "faction_id"],
    fields: [
      field({ key: "title", label: "Título", required: true, priority: 1 }),
      field({ key: "event_type", label: "Tipo de evento", type: "select", options: ["Guerra", "Fundação", "Ritual", "Catástrofe", "Morte", "Descoberta", "Profecia"], priority: 2 }),
      field({ key: "date_label", label: "Data", priority: 3 }),
      field({ key: "era", label: "Era" }),
      field({ key: "year", label: "Ano", inputType: "number" }),
      field({ key: "description", label: "Descrição", type: "textarea" }),
      field({ key: "causes", label: "Causas", type: "textarea" }),
      field({ key: "consequences", label: "Consequências", type: "textarea" }),
      field({ key: "outcome", label: "Resultado", type: "textarea" }),
      field({ key: "secrets", label: "Segredos", type: "textarea" })
    ]
  },
  lore_entries: {
    id: "lore_entries",
    label: "Lore",
    table: "lore_entries",
    titleField: "title",
    createLabel: "Criar lore",
    emptyTitle: "Nenhuma entrada de lore registrada.",
    emptyText: "Crie mitos, religiões, lendas, rumores e notas profundas do cenário.",
    selectFields: "id, scenario_id, event_id, character_id, location_id, faction_id, title, category, summary, content, origin, importance, rumors, adventure_hooks, master_notes, created_at, updated_at",
    relations: ["event_id", "character_id", "location_id", "faction_id"],
    fields: [
      field({ key: "title", label: "Título", required: true, priority: 1 }),
      field({ key: "category", label: "Categoria", type: "select", options: ["Mito", "Religião", "Lenda", "Rumor", "Organização", "Artefato", "Segredo"], priority: 2 }),
      field({ key: "summary", label: "Resumo", type: "textarea", priority: 3 }),
      field({ key: "content", label: "Conteúdo", type: "textarea" }),
      field({ key: "origin", label: "Origem" }),
      field({ key: "importance", label: "Importância", type: "textarea" }),
      field({ key: "rumors", label: "Rumores", type: "textarea" }),
      field({ key: "adventure_hooks", label: "Ganchos de aventura", type: "textarea" }),
      field({ key: "master_notes", label: "Notas do mestre", type: "textarea" })
    ]
  }
};

export const sections: Array<{ id: ActiveSection; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "nations", label: "Nações" },
  { id: "settlements", label: "Assentamentos" },
  { id: "locations", label: "Locais" },
  { id: "factions", label: "Facções" },
  { id: "characters", label: "Personagens" },
  { id: "timeline_events", label: "Linha do tempo" },
  { id: "lore_entries", label: "Lore" }
];

export const fieldLabels = Object.values(sectionConfigs).reduce<Record<string, string>>((acc, config) => {
  for (const item of config.fields) acc[item.key] = item.label;
  for (const relation of config.relations ?? []) acc[relation] = relationLabels[relation];
  return acc;
}, {});
