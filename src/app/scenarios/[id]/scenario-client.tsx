"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Scenario = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type Nation = {
  id: string;
  scenario_id: string;
  name: string;
  description: string | null;
  government_type: string | null;
  capital: string | null;
  culture: string | null;
  religion: string | null;
  current_conflicts: string | null;
  master_secret: string | null;
  created_at: string;
  updated_at: string;
};

type Location = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  name: string;
  type: string | null;
  description: string | null;
  population: string | null;
  ruler: string | null;
  importance: string | null;
  current_situation: string | null;
  master_secret: string | null;
  created_at: string;
  updated_at: string;
};

type Faction = {
  id: string;
  scenario_id: string;
  nation_id: string | null;
  location_id: string | null;
  name: string;
  type: string | null;
  description: string | null;
  goal: string | null;
  leader: string | null;
  allies: string | null;
  enemies: string | null;
  influence_level: string | null;
  current_status: string | null;
  master_secret: string | null;
  created_at: string;
  updated_at: string;
};

type GenericRecord = Record<string, unknown> & {
  id: string;
  name?: string | null;
  title?: string | null;
  type?: string | null;
  category?: string | null;
  event_type?: string | null;
};

type ActiveSection = "overview" | "nations" | "settlements" | "locations" | "factions" | "characters" | "timeline_events" | "lore_entries";
type EditorMode = "scenario" | "nation-create" | "nation-edit" | "location-create" | "location-edit" | "faction-create" | "faction-edit" | null;

const sections: Array<{ id: ActiveSection; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "nations", label: "Nações" },
  { id: "settlements", label: "Assentamentos" },
  { id: "locations", label: "Locais" },
  { id: "factions", label: "Facções" },
  { id: "characters", label: "Personagens" },
  { id: "timeline_events", label: "Linha do tempo" },
  { id: "lore_entries", label: "Lore" }
];

const nationSelect = "id, scenario_id, name, description, government_type, capital, culture, religion, current_conflicts, master_secret, created_at, updated_at";
const locationSelect = "id, scenario_id, nation_id, name, type, description, population, ruler, importance, current_situation, master_secret, created_at, updated_at";
const factionSelect = "id, scenario_id, nation_id, location_id, name, type, description, goal, leader, allies, enemies, influence_level, current_status, master_secret, created_at, updated_at";

const labels: Record<string, string> = {
  name: "Nome",
  title: "Título",
  type: "Tipo",
  category: "Categoria",
  event_type: "Tipo de evento",
  description: "Descrição",
  summary: "Resumo",
  content: "Conteúdo",
  population: "População",
  government: "Governo",
  economy: "Economia",
  notable_places: "Pontos notáveis",
  importance: "Importância",
  current_situation: "Situação atual",
  dangers: "Perigos",
  rumors: "Rumores",
  date_label: "Data",
  era: "Era",
  year: "Ano",
  causes: "Causas",
  consequences: "Consequências",
  outcome: "Resultado",
  origin: "Origem",
  related_entities: "Entidades relacionadas",
  adventure_hooks: "Ganchos de aventura",
  master_notes: "Notas do mestre",
  master_secret: "Segredo do mestre",
  race: "Raça",
  class_role: "Função",
  personality: "Personalidade",
  background: "Histórico",
  goals: "Objetivos",
  secrets: "Segredos"
};

const visibleFieldsBySection: Record<Exclude<ActiveSection, "overview" | "nations" | "locations" | "factions">, string[]> = {
  settlements: ["name", "type", "description", "population", "government", "economy", "notable_places", "current_situation", "importance", "master_secret"],
  characters: ["name", "title", "type", "race", "class_role", "description", "personality", "background", "goals", "secrets"],
  timeline_events: ["title", "event_type", "date_label", "era", "year", "description", "causes", "consequences", "outcome", "secrets"],
  lore_entries: ["title", "category", "summary", "content", "origin", "importance", "rumors", "adventure_hooks", "master_notes"]
};

function readableValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Não definido";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function titleOf(item: GenericRecord) {
  return item.name || item.title || "Registro sem nome";
}

function FieldView({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="forge-card" style={{ padding: "14px" }}>
      <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>{label}</p>
      <strong style={{ display: "block", marginTop: "6px", lineHeight: 1.45 }}>{value?.trim() || "Não definido"}</strong>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="forge-card" style={{ padding: "16px" }}>
      <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>{label}</p>
      <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.65 }}>{value?.trim() || "Nenhum registro ainda."}</p>
    </div>
  );
}

function FormLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel: string; onAction: () => void }) {
  return (
    <section className="forge-card-accent" style={{ borderStyle: "dashed", padding: "30px" }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="forge-muted" style={{ lineHeight: 1.6 }}>{text}</p>
      <button className="forge-button-primary" onClick={onAction}>{actionLabel}</button>
    </section>
  );
}

function DangerButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid rgba(248,113,113,0.38)",
        borderRadius: "999px",
        padding: "10px 14px",
        background: "rgba(127,29,29,0.24)",
        color: "var(--forge-danger)",
        fontWeight: 850,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.68 : 1
      }}
    >
      {children}
    </button>
  );
}

function GenericSection({
  title,
  rows,
  fields,
  emptyTitle,
  emptyText
}: {
  title: string;
  rows: GenericRecord[];
  fields: string[];
  emptyTitle: string;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <section className="forge-card-accent" style={{ borderStyle: "dashed", padding: "30px" }}>
        <h2 style={{ marginTop: 0 }}>{emptyTitle}</h2>
        <p className="forge-muted" style={{ lineHeight: 1.6, marginBottom: 0 }}>{emptyText}</p>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <span className="forge-chip">Leitura integrada</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
        {rows.map((item) => {
          const visibleFields = fields.filter((field) => item[field] !== null && item[field] !== undefined && item[field] !== "");
          return (
            <article key={item.id} className="forge-panel" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start" }}>
                <div>
                  <p className="forge-kicker">Registro</p>
                  <h2 style={{ margin: "6px 0 12px" }}>{titleOf(item)}</h2>
                </div>
                {(item.type || item.category || item.event_type) ? <span className="forge-status-pill">{String(item.type || item.category || item.event_type)}</span> : null}
              </div>
              {visibleFields.length === 0 ? (
                <p className="forge-muted">Este registro ainda não possui campos narrativos preenchidos.</p>
              ) : (
                <div style={{ display: "grid", gap: "10px" }}>
                  {visibleFields.map((field) => (
                    <div key={field} className="forge-card" style={{ padding: "14px" }}>
                      <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>{labels[field] ?? field}</p>
                      <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.55 }}>{readableValue(item[field])}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ScenarioClient({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [nations, setNations] = useState<Nation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [settlements, setSettlements] = useState<GenericRecord[]>([]);
  const [characters, setCharacters] = useState<GenericRecord[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<GenericRecord[]>([]);
  const [loreEntries, setLoreEntries] = useState<GenericRecord[]>([]);

  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [editorMode, setEditorMode] = useState<EditorMode>(null);

  const [editingNationId, setEditingNationId] = useState<string | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingFactionId, setEditingFactionId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [nationName, setNationName] = useState("");
  const [nationDescription, setNationDescription] = useState("");
  const [nationGovernmentType, setNationGovernmentType] = useState("");
  const [nationCapital, setNationCapital] = useState("");
  const [nationCulture, setNationCulture] = useState("");
  const [nationReligion, setNationReligion] = useState("");
  const [nationCurrentConflicts, setNationCurrentConflicts] = useState("");
  const [nationMasterSecret, setNationMasterSecret] = useState("");

  const [locationName, setLocationName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [locationNationId, setLocationNationId] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [locationPopulation, setLocationPopulation] = useState("");
  const [locationRuler, setLocationRuler] = useState("");
  const [locationImportance, setLocationImportance] = useState("");
  const [locationCurrentSituation, setLocationCurrentSituation] = useState("");
  const [locationMasterSecret, setLocationMasterSecret] = useState("");

  const [factionName, setFactionName] = useState("");
  const [factionType, setFactionType] = useState("");
  const [factionNationId, setFactionNationId] = useState("");
  const [factionLocationId, setFactionLocationId] = useState("");
  const [factionDescription, setFactionDescription] = useState("");
  const [factionGoal, setFactionGoal] = useState("");
  const [factionLeader, setFactionLeader] = useState("");
  const [factionAllies, setFactionAllies] = useState("");
  const [factionEnemies, setFactionEnemies] = useState("");
  const [factionInfluenceLevel, setFactionInfluenceLevel] = useState("");
  const [factionCurrentStatus, setFactionCurrentStatus] = useState("");
  const [factionMasterSecret, setFactionMasterSecret] = useState("");

  const nationsById = useMemo(() => new Map(nations.map((nation) => [nation.id, nation])), [nations]);
  const locationsById = useMemo(() => new Map(locations.map((location) => [location.id, location])), [locations]);

  useEffect(() => {
    async function loadScenario() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: scenarioData, error: scenarioError } = await supabase
        .from("scenarios")
        .select("id, user_id, name, description, created_at, updated_at")
        .eq("id", scenarioId)
        .eq("user_id", userData.user.id)
        .single();

      if (scenarioError || !scenarioData) {
        setMessage("Cenário não encontrado ou sem permissão de acesso.");
        setLoading(false);
        return;
      }

      const [nationsResult, settlementsResult, locationsResult, factionsResult, charactersResult, timelineResult, loreResult] = await Promise.all([
        supabase.from("nations").select(nationSelect).eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("settlements").select("*").eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("locations").select(locationSelect).eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("factions").select(factionSelect).eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("characters").select("*").eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("timeline_events").select("*").eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("lore_entries").select("*").eq("scenario_id", scenarioData.id).order("created_at", { ascending: false })
      ]);

      setScenario(scenarioData);
      setName(scenarioData.name);
      setDescription(scenarioData.description ?? "");
      setNations(nationsResult.data ?? []);
      setSettlements((settlementsResult.data ?? []) as GenericRecord[]);
      setLocations(locationsResult.data ?? []);
      setFactions(factionsResult.data ?? []);
      setCharacters((charactersResult.data ?? []) as GenericRecord[]);
      setTimelineEvents((timelineResult.data ?? []) as GenericRecord[]);
      setLoreEntries((loreResult.data ?? []) as GenericRecord[]);
      setLoading(false);

      const firstError = nationsResult.error || settlementsResult.error || locationsResult.error || factionsResult.error || charactersResult.error || timelineResult.error || loreResult.error;
      if (firstError) setMessage(firstError.message);
    }

    loadScenario();
  }, [router, scenarioId]);

  function resetNationForm() {
    setEditingNationId(null);
    setNationName("");
    setNationDescription("");
    setNationGovernmentType("");
    setNationCapital("");
    setNationCulture("");
    setNationReligion("");
    setNationCurrentConflicts("");
    setNationMasterSecret("");
  }

  function resetLocationForm() {
    setEditingLocationId(null);
    setLocationName("");
    setLocationType("");
    setLocationNationId("");
    setLocationDescription("");
    setLocationPopulation("");
    setLocationRuler("");
    setLocationImportance("");
    setLocationCurrentSituation("");
    setLocationMasterSecret("");
  }

  function resetFactionForm() {
    setEditingFactionId(null);
    setFactionName("");
    setFactionType("");
    setFactionNationId("");
    setFactionLocationId("");
    setFactionDescription("");
    setFactionGoal("");
    setFactionLeader("");
    setFactionAllies("");
    setFactionEnemies("");
    setFactionInfluenceLevel("");
    setFactionCurrentStatus("");
    setFactionMasterSecret("");
  }

  function closeEditor() {
    setEditorMode(null);
    resetNationForm();
    resetLocationForm();
    resetFactionForm();
  }

  function changeSection(section: ActiveSection) {
    if (activeSection !== section) closeEditor();
    setActiveSection(section);
  }

  function sectionCount(section: ActiveSection) {
    if (section === "nations") return nations.length;
    if (section === "settlements") return settlements.length;
    if (section === "locations") return locations.length;
    if (section === "factions") return factions.length;
    if (section === "characters") return characters.length;
    if (section === "timeline_events") return timelineEvents.length;
    if (section === "lore_entries") return loreEntries.length;
    return null;
  }

  function openScenarioEditor() {
    if (!scenario) return;
    setName(scenario.name);
    setDescription(scenario.description ?? "");
    setEditorMode("scenario");
  }

  function openCreateNationEditor() {
    resetNationForm();
    setActiveSection("nations");
    setEditorMode("nation-create");
  }

  function openEditNationEditor(nation: Nation) {
    setEditingNationId(nation.id);
    setNationName(nation.name);
    setNationDescription(nation.description ?? "");
    setNationGovernmentType(nation.government_type ?? "");
    setNationCapital(nation.capital ?? "");
    setNationCulture(nation.culture ?? "");
    setNationReligion(nation.religion ?? "");
    setNationCurrentConflicts(nation.current_conflicts ?? "");
    setNationMasterSecret(nation.master_secret ?? "");
    setActiveSection("nations");
    setEditorMode("nation-edit");
  }

  function openCreateLocationEditor(preselectedNationId = "") {
    resetLocationForm();
    setLocationNationId(preselectedNationId);
    setActiveSection("locations");
    setEditorMode("location-create");
  }

  function openEditLocationEditor(location: Location) {
    setEditingLocationId(location.id);
    setLocationName(location.name);
    setLocationType(location.type ?? "");
    setLocationNationId(location.nation_id ?? "");
    setLocationDescription(location.description ?? "");
    setLocationPopulation(location.population ?? "");
    setLocationRuler(location.ruler ?? "");
    setLocationImportance(location.importance ?? "");
    setLocationCurrentSituation(location.current_situation ?? "");
    setLocationMasterSecret(location.master_secret ?? "");
    setActiveSection("locations");
    setEditorMode("location-edit");
  }

  function openCreateFactionEditor(preselectedNationId = "", preselectedLocationId = "") {
    resetFactionForm();
    setFactionNationId(preselectedNationId);
    setFactionLocationId(preselectedLocationId);
    setActiveSection("factions");
    setEditorMode("faction-create");
  }

  function openEditFactionEditor(faction: Faction) {
    setEditingFactionId(faction.id);
    setFactionName(faction.name);
    setFactionType(faction.type ?? "");
    setFactionNationId(faction.nation_id ?? "");
    setFactionLocationId(faction.location_id ?? "");
    setFactionDescription(faction.description ?? "");
    setFactionGoal(faction.goal ?? "");
    setFactionLeader(faction.leader ?? "");
    setFactionAllies(faction.allies ?? "");
    setFactionEnemies(faction.enemies ?? "");
    setFactionInfluenceLevel(faction.influence_level ?? "");
    setFactionCurrentStatus(faction.current_status ?? "");
    setFactionMasterSecret(faction.master_secret ?? "");
    setActiveSection("factions");
    setEditorMode("faction-edit");
  }

  async function handleSaveScenario() {
    if (!scenario) return;
    if (!name.trim()) {
      setMessage("O nome do cenário não pode ficar vazio.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("scenarios")
      .update({ name: name.trim(), description: description.trim(), updated_at: new Date().toISOString() })
      .eq("id", scenario.id)
      .eq("user_id", scenario.user_id)
      .select("id, user_id, name, description, created_at, updated_at")
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setScenario(data);
    setName(data.name);
    setDescription(data.description ?? "");
    setEditorMode(null);
    setMessage("Registro gravado na Forja.");
  }

  async function handleCreateNation() {
    if (!scenario) return;
    if (!nationName.trim()) {
      setMessage("Digite um nome para a nação.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("nations")
      .insert({
        scenario_id: scenario.id,
        name: nationName.trim(),
        description: nationDescription.trim(),
        government_type: nationGovernmentType.trim(),
        capital: nationCapital.trim(),
        culture: nationCulture.trim(),
        religion: nationReligion.trim(),
        current_conflicts: nationCurrentConflicts.trim(),
        master_secret: nationMasterSecret.trim()
      })
      .select(nationSelect)
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNations((current) => [data, ...current]);
    closeEditor();
    setMessage("Nação registrada na Forja.");
  }

  async function handleUpdateNation() {
    if (!scenario || !editingNationId) return;
    if (!nationName.trim()) {
      setMessage("Digite um nome para a nação.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("nations")
      .update({
        name: nationName.trim(),
        description: nationDescription.trim(),
        government_type: nationGovernmentType.trim(),
        capital: nationCapital.trim(),
        culture: nationCulture.trim(),
        religion: nationReligion.trim(),
        current_conflicts: nationCurrentConflicts.trim(),
        master_secret: nationMasterSecret.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", editingNationId)
      .eq("scenario_id", scenario.id)
      .select(nationSelect)
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNations((current) => current.map((item) => (item.id === data.id ? data : item)));
    closeEditor();
    setMessage("Nação atualizada na Forja.");
  }

  async function handleDeleteNation(nation: Nation) {
    if (!scenario) return;
    if (!window.confirm(`Apagar "${nation.name}"? Esta ação não pode ser desfeita.`)) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("nations").delete().eq("id", nation.id).eq("scenario_id", scenario.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNations((current) => current.filter((item) => item.id !== nation.id));
    setLocations((current) => current.map((item) => (item.nation_id === nation.id ? { ...item, nation_id: null } : item)));
    setFactions((current) => current.map((item) => (item.nation_id === nation.id ? { ...item, nation_id: null } : item)));
    if (editingNationId === nation.id) closeEditor();
    setMessage("Nação apagada da Forja.");
  }

  async function handleCreateLocation() {
    if (!scenario) return;
    if (!locationName.trim()) {
      setMessage("Digite um nome para o local.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("locations")
      .insert({
        scenario_id: scenario.id,
        nation_id: locationNationId || null,
        name: locationName.trim(),
        type: locationType.trim(),
        description: locationDescription.trim(),
        population: locationPopulation.trim(),
        ruler: locationRuler.trim(),
        importance: locationImportance.trim(),
        current_situation: locationCurrentSituation.trim(),
        master_secret: locationMasterSecret.trim()
      })
      .select(locationSelect)
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setLocations((current) => [data, ...current]);
    closeEditor();
    setMessage("Local registrado na Forja.");
  }

  async function handleUpdateLocation() {
    if (!scenario || !editingLocationId) return;
    if (!locationName.trim()) {
      setMessage("Digite um nome para o local.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("locations")
      .update({
        nation_id: locationNationId || null,
        name: locationName.trim(),
        type: locationType.trim(),
        description: locationDescription.trim(),
        population: locationPopulation.trim(),
        ruler: locationRuler.trim(),
        importance: locationImportance.trim(),
        current_situation: locationCurrentSituation.trim(),
        master_secret: locationMasterSecret.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", editingLocationId)
      .eq("scenario_id", scenario.id)
      .select(locationSelect)
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setLocations((current) => current.map((item) => (item.id === data.id ? data : item)));
    closeEditor();
    setMessage("Local atualizado na Forja.");
  }

  async function handleDeleteLocation(location: Location) {
    if (!scenario) return;
    if (!window.confirm(`Apagar "${location.name}"? Esta ação não pode ser desfeita.`)) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("locations").delete().eq("id", location.id).eq("scenario_id", scenario.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setLocations((current) => current.filter((item) => item.id !== location.id));
    setFactions((current) => current.map((item) => (item.location_id === location.id ? { ...item, location_id: null } : item)));
    if (editingLocationId === location.id) closeEditor();
    setMessage("Local apagado da Forja.");
  }

  async function handleCreateFaction() {
    if (!scenario) return;
    if (!factionName.trim()) {
      setMessage("Digite um nome para a facção.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("factions")
      .insert({
        scenario_id: scenario.id,
        nation_id: factionNationId || null,
        location_id: factionLocationId || null,
        name: factionName.trim(),
        type: factionType.trim(),
        description: factionDescription.trim(),
        goal: factionGoal.trim(),
        leader: factionLeader.trim(),
        allies: factionAllies.trim(),
        enemies: factionEnemies.trim(),
        influence_level: factionInfluenceLevel.trim(),
        current_status: factionCurrentStatus.trim(),
        master_secret: factionMasterSecret.trim()
      })
      .select(factionSelect)
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setFactions((current) => [data, ...current]);
    closeEditor();
    setMessage("Facção registrada na Forja.");
  }

