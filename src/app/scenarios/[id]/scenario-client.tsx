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

type ActiveSection = "overview" | "nations" | "locations" | "factions" | "characters" | "secrets";
type EditorMode = "scenario" | "nation-create" | "nation-edit" | "location-create" | "location-edit" | "faction-create" | "faction-edit" | null;

const sections: Array<{ id: ActiveSection; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "nations", label: "Nações" },
  { id: "locations", label: "Locais" },
  { id: "factions", label: "Facções" },
  { id: "characters", label: "Personagens" },
  { id: "secrets", label: "Segredos" }
];

const nationSelect = "id, scenario_id, name, description, government_type, capital, culture, religion, current_conflicts, master_secret, created_at, updated_at";
const locationSelect = "id, scenario_id, nation_id, name, type, description, population, ruler, importance, current_situation, master_secret, created_at, updated_at";
const factionSelect = "id, scenario_id, nation_id, location_id, name, type, description, goal, leader, allies, enemies, influence_level, current_status, master_secret, created_at, updated_at";

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

export function ScenarioClient({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [nations, setNations] = useState<Nation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);

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

      const [nationsResult, locationsResult, factionsResult] = await Promise.all([
        supabase.from("nations").select(nationSelect).eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("locations").select(locationSelect).eq("scenario_id", scenarioData.id).order("created_at", { ascending: false }),
        supabase.from("factions").select(factionSelect).eq("scenario_id", scenarioData.id).order("created_at", { ascending: false })
      ]);

      setScenario(scenarioData);
      setName(scenarioData.name);
      setDescription(scenarioData.description ?? "");
      setNations(nationsResult.data ?? []);
      setLocations(locationsResult.data ?? []);
      setFactions(factionsResult.data ?? []);
      setLoading(false);

      const firstError = nationsResult.error || locationsResult.error || factionsResult.error;
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

  async function handleUpdateFaction() {
    if (!scenario || !editingFactionId) return;
    if (!factionName.trim()) {
      setMessage("Digite um nome para a facção.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("factions")
      .update({
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
        master_secret: factionMasterSecret.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", editingFactionId)
      .eq("scenario_id", scenario.id)
      .select(factionSelect)
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setFactions((current) => current.map((item) => (item.id === data.id ? data : item)));
    closeEditor();
    setMessage("Facção atualizada na Forja.");
  }

  async function handleDeleteFaction(faction: Faction) {
    if (!scenario) return;
    if (!window.confirm(`Apagar "${faction.name}"? Esta ação não pode ser desfeita.`)) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("factions").delete().eq("id", faction.id).eq("scenario_id", scenario.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setFactions((current) => current.filter((item) => item.id !== faction.id));
    if (editingFactionId === faction.id) closeEditor();
    setMessage("Facção apagada da Forja.");
  }

  if (loading) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section className="forge-card-accent" style={{ padding: "30px" }}>
          <p className="forge-kicker">Master Forge</p>
          <h1>Abrindo cenário...</h1>
        </section>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section className="forge-card-accent" style={{ padding: "30px" }}>
          <h1>Cenário não encontrado</h1>
          <p className="forge-muted">{message}</p>
          <Link href="/dashboard" className="forge-link-primary">Voltar ao dashboard</Link>
        </section>
      </main>
    );
  }

  const stats = [
    ["Nações", nations.length],
    ["Locais", locations.length],
    ["Facções", factions.length],
    ["Segredos", 0]
  ];

  return (
    <main className="forge-page" style={{ display: "grid", gridTemplateColumns: "292px minmax(620px, 1fr) 420px", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.58)" }}>
        <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none", display: "flex", gap: "12px", alignItems: "center", marginBottom: "28px" }}>
          <span className="forge-mark">MF</span>
          <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>

        <div className="forge-card-accent" style={{ padding: "18px", marginBottom: "18px" }}>
          <p className="forge-kicker">Cenário ativo</p>
          <strong style={{ display: "block", fontSize: "20px", marginTop: "8px" }}>{scenario.name}</strong>
        </div>

        <nav style={{ display: "grid", gap: "10px" }}>
          {sections.map((section) => (
            <button
              key={section.id}
              className={activeSection === section.id ? "forge-nav-item-active" : "forge-nav-item"}
              onClick={() => changeSection(section.id)}
              style={{ display: "flex", justifyContent: "space-between", color: "inherit", cursor: "pointer", textAlign: "left" }}
            >
              <span>{section.label}</span>
              {section.id === "nations" ? <small>{nations.length}</small> : null}
              {section.id === "locations" ? <small>{locations.length}</small> : null}
              {section.id === "factions" ? <small>{factions.length}</small> : null}
            </button>
          ))}
        </nav>

        <Link href={`/scenarios/${scenario.id}/atlas`} className="forge-link-pill" style={{ marginTop: "22px", textAlign: "center" }}>Abrir Atlas</Link>
      </aside>

      <section style={{ padding: "34px", overflow: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "flex-start", marginBottom: "26px" }}>
          <div>
            <p className="forge-kicker">Mesa do Mestre</p>
            <h1 style={{ fontSize: "52px", lineHeight: 0.96, margin: "10px 0", letterSpacing: "-0.05em" }}>{scenario.name}</h1>
            <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: "720px" }}>{scenario.description || "Sem crônica inicial ainda."}</p>
          </div>
          <button className="forge-button-ghost" onClick={openScenarioEditor}>Editar cenário</button>
        </header>

        {message ? <p style={{ color: message.includes("Forja") ? "var(--forge-success)" : "var(--forge-danger)", lineHeight: 1.5 }}>{message}</p> : null}

        {activeSection === "overview" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
              {stats.map(([label, value]) => (
                <div key={label} className="forge-card" style={{ padding: "18px" }}>
                  <p className="forge-muted" style={{ margin: 0 }}>{label}</p>
                  <strong style={{ display: "block", fontSize: "32px", marginTop: "6px" }}>{value}</strong>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <button className="forge-card-accent" onClick={openCreateNationEditor} style={{ padding: "22px", color: "inherit", cursor: "pointer", textAlign: "left" }}>
                <p className="forge-kicker">Política</p>
                <h2>Fundar nação</h2>
                <p className="forge-muted">Crie reinos, impérios, tribos e domínios.</p>
              </button>
              <button className="forge-card-accent" onClick={() => openCreateLocationEditor()} style={{ padding: "22px", color: "inherit", cursor: "pointer", textAlign: "left" }}>
                <p className="forge-kicker">Território</p>
                <h2>Registrar local</h2>
                <p className="forge-muted">Adicione cidades, vilas, ruínas e pontos de interesse.</p>
              </button>
              <button className="forge-card-accent" onClick={() => openCreateFactionEditor()} style={{ padding: "22px", color: "inherit", cursor: "pointer", textAlign: "left" }}>
                <p className="forge-kicker">Conflito</p>
                <h2>Criar facção</h2>
                <p className="forge-muted">Organize cultos, guildas, casas nobres e ordens.</p>
              </button>
            </div>
          </>
        ) : null}

        {activeSection === "nations" ? (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ margin: 0 }}>Nações</h2>
              <button className="forge-button-primary" onClick={openCreateNationEditor}>+ Fundar nação</button>
            </div>
            {nations.length === 0 ? (
              <EmptyState title="Nenhuma bandeira foi erguida." text="Crie a primeira nação deste cenário para começar a organizar política, cultura e conflitos." actionLabel="Fundar primeira nação" onAction={openCreateNationEditor} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                {nations.map((nation) => (
                  <article key={nation.id} className="forge-panel" style={{ padding: "22px" }}>
                    <p className="forge-kicker">Nação</p>
                    <h2 style={{ margin: "6px 0 12px" }}>{nation.name}</h2>
                    <TextBlock label="Descrição" value={nation.description} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                      <FieldView label="Governo" value={nation.government_type} />
                      <FieldView label="Capital" value={nation.capital} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                      <button className="forge-button-ghost" onClick={() => openEditNationEditor(nation)}>Editar</button>
                      <button className="forge-button-ghost" onClick={() => openCreateLocationEditor(nation.id)}>Novo local</button>
                      <button className="forge-button-ghost" onClick={() => openCreateFactionEditor(nation.id)}>Nova facção</button>
                      <DangerButton onClick={() => handleDeleteNation(nation)} disabled={saving}>Apagar</DangerButton>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeSection === "locations" ? (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ margin: 0 }}>Locais</h2>
              <button className="forge-button-primary" onClick={() => openCreateLocationEditor()}>+ Registrar local</button>
            </div>
            {locations.length === 0 ? (
              <EmptyState title="O mapa ainda está em branco." text="Registre cidades, vilas, fortalezas, templos e ruínas para dar forma ao cenário." actionLabel="Registrar primeiro local" onAction={() => openCreateLocationEditor()} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                {locations.map((location) => (
                  <article key={location.id} className="forge-panel" style={{ padding: "22px" }}>
                    <p className="forge-kicker">Local</p>
                    <h2 style={{ margin: "6px 0 12px" }}>{location.name}</h2>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {location.type ? <span className="forge-chip">{location.type}</span> : null}
                      {location.nation_id ? <span className="forge-chip">{nationsById.get(location.nation_id)?.name ?? "Nação vinculada"}</span> : null}
                    </div>
                    <TextBlock label="Descrição" value={location.description} />
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                      <button className="forge-button-ghost" onClick={() => openEditLocationEditor(location)}>Editar</button>
                      <button className="forge-button-ghost" onClick={() => openCreateFactionEditor(location.nation_id ?? "", location.id)}>Nova facção</button>
                      <DangerButton onClick={() => handleDeleteLocation(location)} disabled={saving}>Apagar</DangerButton>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeSection === "factions" ? (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ margin: 0 }}>Facções</h2>
              <button className="forge-button-primary" onClick={() => openCreateFactionEditor()}>+ Criar facção</button>
            </div>
            {factions.length === 0 ? (
              <EmptyState title="Nenhuma sombra se move ainda." text="Crie guildas, cultos, ordens e casas nobres para gerar alianças e conflitos." actionLabel="Criar primeira facção" onAction={() => openCreateFactionEditor()} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                {factions.map((faction) => (
                  <article key={faction.id} className="forge-panel" style={{ padding: "22px" }}>
                    <p className="forge-kicker">Facção</p>
                    <h2 style={{ margin: "6px 0 12px" }}>{faction.name}</h2>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {faction.type ? <span className="forge-chip">{faction.type}</span> : null}
                      {faction.influence_level ? <span className="forge-chip">{faction.influence_level}</span> : null}
                      {faction.nation_id ? <span className="forge-chip">{nationsById.get(faction.nation_id)?.name ?? "Nação vinculada"}</span> : null}
                      {faction.location_id ? <span className="forge-chip">{locationsById.get(faction.location_id)?.name ?? "Local vinculado"}</span> : null}
                    </div>
                    <TextBlock label="Objetivo" value={faction.goal} />
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                      <button className="forge-button-ghost" onClick={() => openEditFactionEditor(faction)}>Editar</button>
                      <DangerButton onClick={() => handleDeleteFaction(faction)} disabled={saving}>Apagar</DangerButton>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeSection === "characters" ? <EmptyState title="Personagens ainda não foram ativados." text="Este módulo está reservado para a próxima etapa do Master Forge." actionLabel="Voltar para visão geral" onAction={() => changeSection("overview")} /> : null}
        {activeSection === "secrets" ? <EmptyState title="O grimório de segredos ainda está selado." text="Este módulo será usado para notas privadas, rumores e verdades ocultas." actionLabel="Voltar para visão geral" onAction={() => changeSection("overview")} /> : null}
      </section>

      <aside style={{ borderLeft: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.42)", overflow: "auto" }}>
        {!editorMode ? (
          <section className="forge-card-accent" style={{ padding: "20px" }}>
            <p className="forge-kicker">Painel de edição</p>
            <h2 style={{ margin: "8px 0" }}>Selecione uma ação</h2>
            <p className="forge-muted" style={{ lineHeight: 1.6 }}>Edite o cenário ou crie registros usando os botões da área principal.</p>
          </section>
        ) : null}

        {editorMode === "scenario" ? (
          <section className="forge-panel" style={{ padding: "22px" }}>
            <p className="forge-kicker">Cenário</p>
            <h2>Editar cenário</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <FormLabel label="Nome do cenário"><input className="forge-input" value={name} onChange={(event) => setName(event.target.value)} /></FormLabel>
              <FormLabel label="Crônica inicial"><textarea className="forge-textarea" value={description} onChange={(event) => setDescription(event.target.value)} style={{ minHeight: "140px" }} /></FormLabel>
              <button className="forge-button-primary" onClick={handleSaveScenario} disabled={saving}>{saving ? "Gravando..." : "Gravar cenário"}</button>
              <button className="forge-button-ghost" onClick={closeEditor}>Cancelar</button>
            </div>
          </section>
        ) : null}

        {(editorMode === "nation-create" || editorMode === "nation-edit") ? (
          <section className="forge-panel" style={{ padding: "22px" }}>
            <p className="forge-kicker">Nação</p>
            <h2>{editorMode === "nation-create" ? "Fundar nação" : "Editar nação"}</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <FormLabel label="Nome"><input className="forge-input" value={nationName} onChange={(event) => setNationName(event.target.value)} /></FormLabel>
              <FormLabel label="Descrição"><textarea className="forge-textarea" value={nationDescription} onChange={(event) => setNationDescription(event.target.value)} /></FormLabel>
              <FormLabel label="Tipo de governo"><input className="forge-input" value={nationGovernmentType} onChange={(event) => setNationGovernmentType(event.target.value)} /></FormLabel>
              <FormLabel label="Capital"><input className="forge-input" value={nationCapital} onChange={(event) => setNationCapital(event.target.value)} /></FormLabel>
              <FormLabel label="Cultura"><textarea className="forge-textarea" value={nationCulture} onChange={(event) => setNationCulture(event.target.value)} /></FormLabel>
              <FormLabel label="Religião"><input className="forge-input" value={nationReligion} onChange={(event) => setNationReligion(event.target.value)} /></FormLabel>
              <FormLabel label="Conflitos atuais"><textarea className="forge-textarea" value={nationCurrentConflicts} onChange={(event) => setNationCurrentConflicts(event.target.value)} /></FormLabel>
              <FormLabel label="Segredo do mestre"><textarea className="forge-textarea" value={nationMasterSecret} onChange={(event) => setNationMasterSecret(event.target.value)} /></FormLabel>
              <button className="forge-button-primary" onClick={editorMode === "nation-create" ? handleCreateNation : handleUpdateNation} disabled={saving}>{saving ? "Gravando..." : "Gravar nação"}</button>
              <button className="forge-button-ghost" onClick={closeEditor}>Cancelar</button>
            </div>
          </section>
        ) : null}

        {(editorMode === "location-create" || editorMode === "location-edit") ? (
          <section className="forge-panel" style={{ padding: "22px" }}>
            <p className="forge-kicker">Local</p>
            <h2>{editorMode === "location-create" ? "Registrar local" : "Editar local"}</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <FormLabel label="Nome"><input className="forge-input" value={locationName} onChange={(event) => setLocationName(event.target.value)} /></FormLabel>
              <FormLabel label="Tipo"><input className="forge-input" value={locationType} onChange={(event) => setLocationType(event.target.value)} placeholder="Cidade, vila, ruína, templo..." /></FormLabel>
              <FormLabel label="Nação vinculada">
                <select className="forge-input" value={locationNationId} onChange={(event) => setLocationNationId(event.target.value)}>
                  <option value="">Nenhuma</option>
                  {nations.map((nation) => <option key={nation.id} value={nation.id}>{nation.name}</option>)}
                </select>
              </FormLabel>
              <FormLabel label="Descrição"><textarea className="forge-textarea" value={locationDescription} onChange={(event) => setLocationDescription(event.target.value)} /></FormLabel>
              <FormLabel label="População"><input className="forge-input" value={locationPopulation} onChange={(event) => setLocationPopulation(event.target.value)} /></FormLabel>
              <FormLabel label="Governante"><input className="forge-input" value={locationRuler} onChange={(event) => setLocationRuler(event.target.value)} /></FormLabel>
              <FormLabel label="Importância"><textarea className="forge-textarea" value={locationImportance} onChange={(event) => setLocationImportance(event.target.value)} /></FormLabel>
              <FormLabel label="Situação atual"><textarea className="forge-textarea" value={locationCurrentSituation} onChange={(event) => setLocationCurrentSituation(event.target.value)} /></FormLabel>
              <FormLabel label="Segredo do mestre"><textarea className="forge-textarea" value={locationMasterSecret} onChange={(event) => setLocationMasterSecret(event.target.value)} /></FormLabel>
              <button className="forge-button-primary" onClick={editorMode === "location-create" ? handleCreateLocation : handleUpdateLocation} disabled={saving}>{saving ? "Gravando..." : "Gravar local"}</button>
              <button className="forge-button-ghost" onClick={closeEditor}>Cancelar</button>
            </div>
          </section>
        ) : null}

        {(editorMode === "faction-create" || editorMode === "faction-edit") ? (
          <section className="forge-panel" style={{ padding: "22px" }}>
            <p className="forge-kicker">Facção</p>
            <h2>{editorMode === "faction-create" ? "Criar facção" : "Editar facção"}</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <FormLabel label="Nome"><input className="forge-input" value={factionName} onChange={(event) => setFactionName(event.target.value)} /></FormLabel>
              <FormLabel label="Tipo"><input className="forge-input" value={factionType} onChange={(event) => setFactionType(event.target.value)} placeholder="Guilda, culto, ordem, casa nobre..." /></FormLabel>
              <FormLabel label="Nação vinculada">
                <select className="forge-input" value={factionNationId} onChange={(event) => setFactionNationId(event.target.value)}>
                  <option value="">Nenhuma</option>
                  {nations.map((nation) => <option key={nation.id} value={nation.id}>{nation.name}</option>)}
                </select>
              </FormLabel>
              <FormLabel label="Local vinculado">
                <select className="forge-input" value={factionLocationId} onChange={(event) => setFactionLocationId(event.target.value)}>
                  <option value="">Nenhum</option>
                  {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
              </FormLabel>
              <FormLabel label="Descrição"><textarea className="forge-textarea" value={factionDescription} onChange={(event) => setFactionDescription(event.target.value)} /></FormLabel>
              <FormLabel label="Objetivo"><textarea className="forge-textarea" value={factionGoal} onChange={(event) => setFactionGoal(event.target.value)} /></FormLabel>
              <FormLabel label="Líder"><input className="forge-input" value={factionLeader} onChange={(event) => setFactionLeader(event.target.value)} /></FormLabel>
              <FormLabel label="Aliados"><textarea className="forge-textarea" value={factionAllies} onChange={(event) => setFactionAllies(event.target.value)} /></FormLabel>
              <FormLabel label="Inimigos"><textarea className="forge-textarea" value={factionEnemies} onChange={(event) => setFactionEnemies(event.target.value)} /></FormLabel>
              <FormLabel label="Nível de influência"><input className="forge-input" value={factionInfluenceLevel} onChange={(event) => setFactionInfluenceLevel(event.target.value)} /></FormLabel>
              <FormLabel label="Status atual"><input className="forge-input" value={factionCurrentStatus} onChange={(event) => setFactionCurrentStatus(event.target.value)} /></FormLabel>
              <FormLabel label="Segredo do mestre"><textarea className="forge-textarea" value={factionMasterSecret} onChange={(event) => setFactionMasterSecret(event.target.value)} /></FormLabel>
              <button className="forge-button-primary" onClick={editorMode === "faction-create" ? handleCreateFaction : handleUpdateFaction} disabled={saving}>{saving ? "Gravando..." : "Gravar facção"}</button>
              <button className="forge-button-ghost" onClick={closeEditor}>Cancelar</button>
            </div>
          </section>
        ) : null}
      </aside>
    </main>
  );
}
