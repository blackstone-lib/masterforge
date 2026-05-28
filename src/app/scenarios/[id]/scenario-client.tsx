"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

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
  user_id: string;
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
  user_id: string;
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
  user_id: string;
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

type ActiveSection =
  | "overview"
  | "nations"
  | "locations"
  | "factions"
  | "characters"
  | "secrets";

type EditorMode =
  | "scenario"
  | "nation-create"
  | "nation-edit"
  | "location-create"
  | "location-edit"
  | "faction-create"
  | "faction-edit"
  | null;

const sections: Array<{ id: ActiveSection; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "nations", label: "Nações" },
  { id: "locations", label: "Locais" },
  { id: "factions", label: "Facções" },
  { id: "characters", label: "Personagens" },
  { id: "secrets", label: "Segredos" }
];

const selectFields =
  "id, scenario_id, nation_id, location_id, user_id, name, type, description, goal, leader, allies, enemies, influence_level, current_status, master_secret, created_at, updated_at";

function FieldView({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="forge-card" style={{ padding: "14px" }}>
      <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>{label}</p>
      <strong style={{ display: "block", marginTop: "6px", lineHeight: 1.45 }}>
        {value?.trim() || "Não definido"}
      </strong>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="forge-card" style={{ padding: "16px" }}>
      <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>{label}</p>
      <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.65 }}>
        {value?.trim() || "Nenhum registro ainda."}
      </p>
    </div>
  );
}

function FormLabel({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>
        {label}
      </span>
      {children}
    </label>
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

  const [creatingNation, setCreatingNation] = useState(false);
  const [savingNation, setSavingNation] = useState(false);
  const [deletingNationId, setDeletingNationId] = useState<string | null>(null);

  const [creatingLocation, setCreatingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  const [creatingFaction, setCreatingFaction] = useState(false);
  const [savingFaction, setSavingFaction] = useState(false);
  const [deletingFactionId, setDeletingFactionId] = useState<string | null>(null);

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

      const { data, error } = await supabase
        .from("scenarios")
        .select("id, user_id, name, description, created_at, updated_at")
        .eq("id", scenarioId)
        .eq("user_id", userData.user.id)
        .single();

      if (error) {
        setMessage("Cenário não encontrado ou sem permissão de acesso.");
        setLoading(false);
        return;
      }

      const { data: nationsData, error: nationsError } = await supabase
        .from("nations")
        .select("id, scenario_id, user_id, name, description, government_type, capital, culture, religion, current_conflicts, master_secret, created_at, updated_at")
        .eq("scenario_id", data.id)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      const { data: locationsData, error: locationsError } = await supabase
        .from("locations")
        .select("id, scenario_id, nation_id, user_id, name, type, description, population, ruler, importance, current_situation, master_secret, created_at, updated_at")
        .eq("scenario_id", data.id)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      const { data: factionsData, error: factionsError } = await supabase
        .from("factions")
        .select(selectFields)
        .eq("scenario_id", data.id)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      setScenario(data);
      setName(data.name);
      setDescription(data.description ?? "");
      setNations(nationsError ? [] : nationsData ?? []);
      setLocations(locationsError ? [] : locationsData ?? []);
      setFactions(factionsError ? [] : factionsData ?? []);
      setLoading(false);

      if (nationsError) setMessage("Tabela de nações ainda não encontrada. Rode o SQL de criação no Supabase.");
      if (locationsError) setMessage("Tabela de locais ainda não encontrada. Rode o SQL de criação no Supabase.");
      if (factionsError) setMessage("Tabela de facções ainda não encontrada. Rode o SQL de criação no Supabase.");
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
      .update({
        name: name.trim(),
        description: description.trim(),
        updated_at: new Date().toISOString()
      })
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

    setCreatingNation(true);
    setMessage("");

    const { data, error } = await supabase
      .from("nations")
      .insert({
        scenario_id: scenario.id,
        user_id: scenario.user_id,
        name: nationName.trim(),
        description: nationDescription.trim(),
        government_type: nationGovernmentType.trim(),
        capital: nationCapital.trim(),
        culture: nationCulture.trim(),
        religion: nationReligion.trim(),
        current_conflicts: nationCurrentConflicts.trim(),
        master_secret: nationMasterSecret.trim()
      })
      .select("id, scenario_id, user_id, name, description, government_type, capital, culture, religion, current_conflicts, master_secret, created_at, updated_at")
      .single();

    setCreatingNation(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) setNations((current) => [data, ...current]);
    closeEditor();
    setMessage("Nação registrada na Forja.");
  }

  async function handleUpdateNation() {
    if (!scenario || !editingNationId) return;

    if (!nationName.trim()) {
      setMessage("Digite um nome para a nação.");
      return;
    }

    setSavingNation(true);
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
      .eq("user_id", scenario.user_id)
      .select("id, scenario_id, user_id, name, description, government_type, capital, culture, religion, current_conflicts, master_secret, created_at, updated_at")
      .single();

    setSavingNation(false);

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

    const confirmed = window.confirm(`Apagar "${nation.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setDeletingNationId(nation.id);
    setMessage("");

    const { error } = await supabase
      .from("nations")
      .delete()
      .eq("id", nation.id)
      .eq("scenario_id", scenario.id)
      .eq("user_id", scenario.user_id);

    setDeletingNationId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNations((current) => current.filter((item) => item.id !== nation.id));
    setLocations((current) => current.map((item) => item.nation_id === nation.id ? { ...item, nation_id: null } : item));
    setFactions((current) => current.map((item) => item.nation_id === nation.id ? { ...item, nation_id: null } : item));

    if (editingNationId === nation.id) closeEditor();

    setMessage("Nação apagada da Forja.");
  }

  async function handleCreateLocation() {
    if (!scenario) return;

    if (!locationName.trim()) {
      setMessage("Digite um nome para o local.");
      return;
    }

    setCreatingLocation(true);
    setMessage("");

    const { data, error } = await supabase
      .from("locations")
      .insert({
        scenario_id: scenario.id,
        user_id: scenario.user_id,
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
      .select("id, scenario_id, nation_id, user_id, name, type, description, population, ruler, importance, current_situation, master_secret, created_at, updated_at")
      .single();

    setCreatingLocation(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) setLocations((current) => [data, ...current]);
    closeEditor();
    setMessage("Local registrado na Forja.");
  }

  async function handleUpdateLocation() {
    if (!scenario || !editingLocationId) return;

    if (!locationName.trim()) {
      setMessage("Digite um nome para o local.");
      return;
    }

    setSavingLocation(true);
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
      .eq("user_id", scenario.user_id)
      .select("id, scenario_id, nation_id, user_id, name, type, description, population, ruler, importance, current_situation, master_secret, created_at, updated_at")
      .single();

    setSavingLocation(false);

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

    const confirmed = window.confirm(`Apagar "${location.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setDeletingLocationId(location.id);
    setMessage("");

    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", location.id)
      .eq("scenario_id", scenario.id)
      .eq("user_id", scenario.user_id);

    setDeletingLocationId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setLocations((current) => current.filter((item) => item.id !== location.id));
    setFactions((current) => current.map((item) => item.location_id === location.id ? { ...item, location_id: null } : item));

    if (editingLocationId === location.id) closeEditor();

    setMessage("Local apagado da Forja.");
  }

  async function handleCreateFaction() {
    if (!scenario) return;

    if (!factionName.trim()) {
      setMessage("Digite um nome para a facção.");
      return;
    }

    setCreatingFaction(true);
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
      .select(selectFields)
      .single();

    setCreatingFaction(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) setFactions((current) => [data, ...current]);
    closeEditor();
    setMessage("Facção registrada na Forja.");
  }

  async function handleUpdateFaction() {
    if (!scenario || !editingFactionId) return;

    if (!factionName.trim()) {
      setMessage("Digite um nome para a facção.");
      return;
    }

    setSavingFaction(true);
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
      .eq("user_id", scenario.user_id)
      .select(selectFields)
      .single();

    setSavingFaction(false);

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

    const confirmed = window.confirm(`Apagar "${faction.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setDeletingFactionId(faction.id);
    setMessage("");

    const { error } = await supabase
      .from("factions")
      .delete()
      .eq("id", faction.id)
      .eq("scenario_id", scenario.id)
      .eq("user_id", scenario.user_id);

    setDeletingFactionId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setFactions((current) => current.filter((item) => item.id !== faction.id));

    if (editingFactionId === faction.id) closeEditor();

    setMessage("Facção apagada da Forja.");
  }

  const sectionCount = (section: ActiveSection) => {
    if (section === "nations") return nations.length;
    if (section === "locations") return locations.length;
    if (section === "factions") return factions.length;
    return 0;
  };

  const deleteButtonStyle = (disabled: boolean): CSSProperties => ({
    border: "1px solid rgba(248,113,113,0.38)",
    borderRadius: "999px",
    padding: "11px 16px",
    background: "rgba(127,29,29,0.24)",
    color: "var(--forge-danger)",
    fontWeight: 850,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.68 : 1
  });

  if (loading) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <div className="forge-card-accent" style={{ padding: "30px", boxShadow: "0 24px 80px rgba(0,0,0,0.32)" }}>
          <p className="forge-kicker">Master Forge</p>
          <h1 style={{ marginBottom: 0 }}>Abrindo seu grimório...</h1>
        </div>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section style={{ border: "1px solid rgba(248,113,113,0.3)", borderRadius: "28px", padding: "30px", background: "rgba(127,29,29,0.18)", maxWidth: "560px" }}>
          <p style={{ color: "#fca5a5", fontWeight: 900, marginTop: 0, letterSpacing: "0.14em", textTransform: "uppercase" }}>Acesso negado</p>
          <h1>Cenário não encontrado</h1>
          <p className="forge-muted-strong" style={{ lineHeight: 1.6 }}>{message}</p>
          <Link href="/dashboard" className="forge-link-primary">Voltar ao Arquivo dos Reinos</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="forge-page" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <header style={{ height: "74px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid var(--forge-border)", background: "rgba(2,6,23,0.78)", backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Link href="/dashboard" style={{ color: "var(--forge-muted)", textDecoration: "none" }}>← Arquivo dos Reinos</Link>
          <span style={{ width: "1px", height: "28px", background: "var(--forge-border)" }} />
          <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Master Forge</strong>
        </div>
        <span style={{ color: message.includes("Forja") ? "var(--forge-success)" : "var(--forge-muted)", fontSize: "14px" }}>
          {message || "Pronto para editar"}
        </span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: editorMode ? "292px minmax(560px, 1fr) 420px" : "292px minmax(560px, 1fr)", minHeight: "calc(100vh - 74px)" }}>
        <aside style={{ borderRight: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.58)" }}>
          <p className="forge-kicker">Árvore do mundo</p>

          <div className="forge-card-accent" style={{ padding: "18px", marginTop: "14px", marginBottom: "18px" }}>
            <strong style={{ display: "block", fontSize: "17px" }}>{scenario.name}</strong>
            <p className="forge-muted" style={{ lineHeight: 1.5, margin: "8px 0 0", fontSize: "14px" }}>
              Abra uma seção para ver seus registros em cards. Edite apenas quando precisar.
            </p>
          </div>

          <nav style={{ display: "grid", gap: "10px" }}>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? "forge-nav-item-active" : "forge-nav-item"}
                onClick={() => changeSection(section.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "inherit",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <span>{activeSection === section.id ? "▾" : "▸"} {section.label}</span>
                {section.id !== "overview" ? <small style={{ color: "var(--forge-muted)" }}>{sectionCount(section.id)}</small> : null}
              </button>
            ))}
          </nav>

          <div style={{ border: "1px dashed rgba(197,124,38,0.42)", borderRadius: "22px", padding: "18px", background: "rgba(197,124,38,0.07)", marginTop: "22px", display: "grid", gap: "10px" }}>
            <strong>Forja rápida</strong>
            <p className="forge-muted" style={{ lineHeight: 1.55, margin: "0 0 4px", fontSize: "14px" }}>
              Crie registros sem abrir formulários permanentes na tela.
            </p>
            <button className="forge-button-primary" style={{ width: "100%" }} onClick={openCreateNationEditor}>+ Erguer nação</button>
            <button className="forge-button-ghost" style={{ width: "100%" }} onClick={() => openCreateLocationEditor()}>+ Registrar local</button>
            <button className="forge-button-ghost" style={{ width: "100%" }} onClick={() => openCreateFactionEditor()}>+ Criar facção</button>
          </div>
        </aside>

        <section style={{ padding: "34px", overflow: "auto" }}>
          <div style={{ maxWidth: "980px" }}>
            {activeSection === "overview" ? (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", marginBottom: "26px" }}>
                  <div>
                    <p className="forge-kicker">Visão geral do cenário</p>
                    <h1 style={{ fontSize: "54px", lineHeight: 0.96, margin: "10px 0", letterSpacing: "-0.06em" }}>{scenario.name}</h1>
                    <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: "720px", fontSize: "16px" }}>
                      Um resumo limpo do mundo, com edição aberta apenas quando necessário.
                    </p>
                  </div>
                  <button className="forge-button-primary" onClick={openScenarioEditor}>Editar cenário</button>
                </div>

                <article className="forge-panel" style={{ padding: "26px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px" }}>
                    <div>
                      <p className="forge-kicker">Cenário</p>
                      <h2 style={{ fontSize: "36px", margin: "8px 0 10px" }}>{scenario.name}</h2>
                    </div>
                    <span className="forge-status-pill">Mundo forjado</span>
                  </div>

                  <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
                    <TextBlock label="Crônica inicial" value={scenario.description} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                      <FieldView label="Nações" value={`${nations.length} registrada${nations.length === 1 ? "" : "s"}`} />
                      <FieldView label="Locais" value={`${locations.length} registrado${locations.length === 1 ? "" : "s"}`} />
                      <FieldView label="Facções" value={`${factions.length} ativa${factions.length === 1 ? "" : "s"}`} />
                    </div>
                  </div>
                </article>
              </>
            ) : null}

            {activeSection === "nations" ? (
              <>
                <SectionHeader
                  kicker="Nações & Reinos"
                  title="Povos que moldam este mundo"
                  text="Cada nação aparece como um card completo. Locais e facções vinculados aparecem dentro do card da nação."
                  actionLabel="+ Erguer nova nação"
                  onAction={openCreateNationEditor}
                />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                  {nations.length === 0 ? (
                    <EmptyCard
                      title="Nenhum reino se ergueu neste mundo ainda."
                      text="Crie a primeira nação para começar a estruturar povos, capitais, culturas e conflitos."
                      actionLabel="Erguer primeira nação"
                      onAction={openCreateNationEditor}
                    />
                  ) : nations.map((nation) => {
                    const linkedLocations = locations.filter((location) => location.nation_id === nation.id);
                    const linkedFactions = factions.filter((faction) => faction.nation_id === nation.id);

                    return (
                      <article key={nation.id} className="forge-panel" style={{ padding: "22px" }}>
                        <CardTitle kicker="Nação registrada" title={nation.name} badge="Nação" />

                        <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                          <TextBlock label="Descrição" value={nation.description} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <FieldView label="Capital" value={nation.capital} />
                            <FieldView label="Governo" value={nation.government_type} />
                            <FieldView label="Cultura" value={nation.culture} />
                            <FieldView label="Religião" value={nation.religion} />
                          </div>
                          <TextBlock label="Conflitos atuais" value={nation.current_conflicts} />
                          <TextBlock label="Segredo do Mestre" value={nation.master_secret} />
                          <LinkedListCard title="Locais vinculados" empty="Nenhum local vinculado a esta nação." items={linkedLocations.map((item) => item.name)} />
                          <LinkedListCard title="Facções vinculadas" empty="Nenhuma facção vinculada a esta nação." items={linkedFactions.map((item) => item.name)} />
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                          <button className="forge-button-primary" onClick={() => openEditNationEditor(nation)}>Editar</button>
                          <button className="forge-button-ghost" onClick={() => openCreateLocationEditor(nation.id)}>+ Criar local</button>
                          <button className="forge-button-ghost" onClick={() => openCreateFactionEditor(nation.id)}>+ Criar facção</button>
                          <button type="button" onClick={() => handleDeleteNation(nation)} disabled={deletingNationId === nation.id} style={deleteButtonStyle(deletingNationId === nation.id)}>
                            {deletingNationId === nation.id ? "Apagando..." : "Apagar"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : null}

            {activeSection === "locations" ? (
              <>
                <SectionHeader
                  kicker="Locais"
                  title="Cidades, ruínas e lugares de poder"
                  text="Locais podem estar vinculados a uma nação ou existir de forma independente no cenário."
                  actionLabel="+ Registrar local"
                  onAction={() => openCreateLocationEditor()}
                />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                  {locations.length === 0 ? (
                    <EmptyCard
                      title="Nenhum local foi registrado ainda."
                      text="Crie cidades, vilas, fortalezas, ruínas, templos e masmorras do cenário."
                      actionLabel="Registrar primeiro local"
                      onAction={() => openCreateLocationEditor()}
                    />
                  ) : locations.map((location) => {
                    const linkedNation = location.nation_id ? nationsById.get(location.nation_id) : null;
                    const linkedFactions = factions.filter((faction) => faction.location_id === location.id);

                    return (
                      <article key={location.id} className="forge-panel" style={{ padding: "22px" }}>
                        <CardTitle kicker="Local registrado" title={location.name} badge={location.type || "Local"} />

                        <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                          <TextBlock label="Descrição" value={location.description} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <FieldView label="Nação vinculada" value={linkedNation?.name || "Independente"} />
                            <FieldView label="População" value={location.population} />
                            <FieldView label="Governante" value={location.ruler} />
                            <FieldView label="Importância" value={location.importance} />
                          </div>
                          <TextBlock label="Situação atual" value={location.current_situation} />
                          <TextBlock label="Segredo do Mestre" value={location.master_secret} />
                          <LinkedListCard title="Facções vinculadas" empty="Nenhuma facção vinculada a este local." items={linkedFactions.map((item) => item.name)} />
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                          <button className="forge-button-primary" onClick={() => openEditLocationEditor(location)}>Editar</button>
                          <button className="forge-button-ghost" onClick={() => openCreateFactionEditor(location.nation_id ?? "", location.id)}>+ Criar facção</button>
                          <button type="button" onClick={() => handleDeleteLocation(location)} disabled={deletingLocationId === location.id} style={deleteButtonStyle(deletingLocationId === location.id)}>
                            {deletingLocationId === location.id ? "Apagando..." : "Apagar"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : null}

            {activeSection === "factions" ? (
              <>
                <SectionHeader
                  kicker="Facções"
                  title="Ordens, guildas, cultos e poderes ocultos"
                  text="Facções podem atuar no cenário inteiro ou se vincular a uma nação e/ou local específico."
                  actionLabel="+ Criar facção"
                  onAction={() => openCreateFactionEditor()}
                />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                  {factions.length === 0 ? (
                    <EmptyCard
                      title="Nenhuma facção move as peças deste mundo ainda."
                      text="Crie ordens, guildas, cultos, casas nobres, sociedades secretas ou forças políticas."
                      actionLabel="Criar primeira facção"
                      onAction={() => openCreateFactionEditor()}
                    />
                  ) : factions.map((faction) => {
                    const linkedNation = faction.nation_id ? nationsById.get(faction.nation_id) : null;
                    const linkedLocation = faction.location_id ? locationsById.get(faction.location_id) : null;

                    return (
                      <article key={faction.id} className="forge-panel" style={{ padding: "22px" }}>
                        <CardTitle kicker="Facção registrada" title={faction.name} badge={faction.type || "Facção"} />

                        <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
                          <TextBlock label="Descrição" value={faction.description} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <FieldView label="Nação vinculada" value={linkedNation?.name || "Cenário inteiro"} />
                            <FieldView label="Local vinculado" value={linkedLocation?.name || "Sem local específico"} />
                            <FieldView label="Líder" value={faction.leader} />
                            <FieldView label="Influência" value={faction.influence_level} />
                          </div>
                          <TextBlock label="Objetivo" value={faction.goal} />
                          <TextBlock label="Aliados" value={faction.allies} />
                          <TextBlock label="Inimigos" value={faction.enemies} />
                          <TextBlock label="Situação atual" value={faction.current_status} />
                          <TextBlock label="Segredo do Mestre" value={faction.master_secret} />
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                          <button className="forge-button-primary" onClick={() => openEditFactionEditor(faction)}>Editar</button>
                          <button type="button" onClick={() => handleDeleteFaction(faction)} disabled={deletingFactionId === faction.id} style={deleteButtonStyle(deletingFactionId === faction.id)}>
                            {deletingFactionId === faction.id ? "Apagando..." : "Apagar"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : null}

            {["characters", "secrets"].includes(activeSection) ? (
              <article className="forge-card-accent" style={{ padding: "30px", borderStyle: "dashed" }}>
                <p className="forge-kicker">Em breve</p>
                <h1 style={{ marginTop: "8px" }}>{sections.find((section) => section.id === activeSection)?.label}</h1>
                <p className="forge-muted" style={{ lineHeight: 1.6, maxWidth: "620px" }}>
                  Essa seção seguirá o mesmo padrão: cards de leitura e edição sob demanda.
                </p>
              </article>
            ) : null}
          </div>
        </section>

        {editorMode ? (
          <aside style={{ borderLeft: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.72)", position: "sticky", top: "74px", height: "calc(100vh - 74px)", overflow: "auto" }}>
            <EditorHeader mode={editorMode} onClose={closeEditor} />

            {editorMode === "scenario" ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <FormLabel label="Nome público do cenário">
                  <input className="forge-input" value={name} onChange={(event) => setName(event.target.value)} />
                </FormLabel>
                <FormLabel label="Crônica inicial">
                  <textarea className="forge-textarea" value={description} onChange={(event) => setDescription(event.target.value)} style={{ minHeight: "180px" }} />
                </FormLabel>
                <button className="forge-button-primary" onClick={handleSaveScenario} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Gravando..." : "Registrar na Forja"}
                </button>
              </div>
            ) : null}

            {editorMode === "nation-create" || editorMode === "nation-edit" ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <FormLabel label="Nome da nação">
                  <input className="forge-input" value={nationName} onChange={(event) => setNationName(event.target.value)} placeholder="Ex: Reino de Aurel" />
                </FormLabel>
                <FormLabel label="Capital">
                  <input className="forge-input" value={nationCapital} onChange={(event) => setNationCapital(event.target.value)} placeholder="Ex: Áurica" />
                </FormLabel>
                <FormLabel label="Tipo de governo">
                  <input className="forge-input" value={nationGovernmentType} onChange={(event) => setNationGovernmentType(event.target.value)} placeholder="Monarquia, teocracia..." />
                </FormLabel>
                <FormLabel label="Cultura">
                  <input className="forge-input" value={nationCulture} onChange={(event) => setNationCulture(event.target.value)} placeholder="Tradições, costumes..." />
                </FormLabel>
                <FormLabel label="Religião dominante">
                  <input className="forge-input" value={nationReligion} onChange={(event) => setNationReligion(event.target.value)} placeholder="Culto, panteão..." />
                </FormLabel>
                <FormLabel label="Descrição">
                  <textarea className="forge-textarea" value={nationDescription} onChange={(event) => setNationDescription(event.target.value)} style={{ minHeight: "110px" }} />
                </FormLabel>
                <FormLabel label="Conflitos atuais">
                  <textarea className="forge-textarea" value={nationCurrentConflicts} onChange={(event) => setNationCurrentConflicts(event.target.value)} style={{ minHeight: "90px" }} />
                </FormLabel>
                <FormLabel label="Segredo do Mestre">
                  <textarea className="forge-textarea" value={nationMasterSecret} onChange={(event) => setNationMasterSecret(event.target.value)} style={{ minHeight: "90px" }} />
                </FormLabel>
                <button className="forge-button-primary" onClick={editorMode === "nation-create" ? handleCreateNation : handleUpdateNation} disabled={creatingNation || savingNation} style={{ opacity: creatingNation || savingNation ? 0.7 : 1 }}>
                  {editorMode === "nation-create" ? creatingNation ? "Erguendo..." : "Registrar nação" : savingNation ? "Gravando..." : "Atualizar nação"}
                </button>
              </div>
            ) : null}

            {editorMode === "location-create" || editorMode === "location-edit" ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <FormLabel label="Nome do local">
                  <input className="forge-input" value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="Ex: Fortaleza do Sol" />
                </FormLabel>
                <FormLabel label="Tipo">
                  <input className="forge-input" value={locationType} onChange={(event) => setLocationType(event.target.value)} placeholder="Cidade, vila, ruína, templo..." />
                </FormLabel>
                <FormLabel label="Nação vinculada">
                  <select className="forge-input" value={locationNationId} onChange={(event) => setLocationNationId(event.target.value)}>
                    <option value="">Independente / sem nação</option>
                    {nations.map((nation) => <option key={nation.id} value={nation.id}>{nation.name}</option>)}
                  </select>
                </FormLabel>
                <FormLabel label="Descrição">
                  <textarea className="forge-textarea" value={locationDescription} onChange={(event) => setLocationDescription(event.target.value)} style={{ minHeight: "110px" }} />
                </FormLabel>
                <FormLabel label="População">
                  <input className="forge-input" value={locationPopulation} onChange={(event) => setLocationPopulation(event.target.value)} placeholder="Ex: 12 mil habitantes" />
                </FormLabel>
                <FormLabel label="Governante ou responsável">
                  <input className="forge-input" value={locationRuler} onChange={(event) => setLocationRuler(event.target.value)} placeholder="Ex: Duquesa Alenya" />
                </FormLabel>
                <FormLabel label="Importância">
                  <input className="forge-input" value={locationImportance} onChange={(event) => setLocationImportance(event.target.value)} placeholder="Comercial, militar, sagrada..." />
                </FormLabel>
                <FormLabel label="Situação atual">
                  <textarea className="forge-textarea" value={locationCurrentSituation} onChange={(event) => setLocationCurrentSituation(event.target.value)} style={{ minHeight: "90px" }} />
                </FormLabel>
                <FormLabel label="Segredo do Mestre">
                  <textarea className="forge-textarea" value={locationMasterSecret} onChange={(event) => setLocationMasterSecret(event.target.value)} style={{ minHeight: "90px" }} />
                </FormLabel>
                <button className="forge-button-primary" onClick={editorMode === "location-create" ? handleCreateLocation : handleUpdateLocation} disabled={creatingLocation || savingLocation} style={{ opacity: creatingLocation || savingLocation ? 0.7 : 1 }}>
                  {editorMode === "location-create" ? creatingLocation ? "Registrando..." : "Registrar local" : savingLocation ? "Gravando..." : "Atualizar local"}
                </button>
              </div>
            ) : null}

            {editorMode === "faction-create" || editorMode === "faction-edit" ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <FormLabel label="Nome da facção">
                  <input className="forge-input" value={factionName} onChange={(event) => setFactionName(event.target.value)} placeholder="Ex: Culto da Maré Negra" />
                </FormLabel>
                <FormLabel label="Tipo">
                  <input className="forge-input" value={factionType} onChange={(event) => setFactionType(event.target.value)} placeholder="Culto, guilda, ordem, casa nobre..." />
                </FormLabel>
                <FormLabel label="Nação vinculada">
                  <select className="forge-input" value={factionNationId} onChange={(event) => setFactionNationId(event.target.value)}>
                    <option value="">Cenário inteiro / sem nação</option>
                    {nations.map((nation) => <option key={nation.id} value={nation.id}>{nation.name}</option>)}
                  </select>
                </FormLabel>
                <FormLabel label="Local vinculado">
                  <select className="forge-input" value={factionLocationId} onChange={(event) => setFactionLocationId(event.target.value)}>
                    <option value="">Sem local específico</option>
                    {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                  </select>
                </FormLabel>
                <FormLabel label="Líder">
                  <input className="forge-input" value={factionLeader} onChange={(event) => setFactionLeader(event.target.value)} placeholder="Ex: Arquimaga Velora" />
                </FormLabel>
                <FormLabel label="Nível de influência">
                  <input className="forge-input" value={factionInfluenceLevel} onChange={(event) => setFactionInfluenceLevel(event.target.value)} placeholder="Baixa, regional, continental..." />
                </FormLabel>
                <FormLabel label="Descrição">
                  <textarea className="forge-textarea" value={factionDescription} onChange={(event) => setFactionDescription(event.target.value)} style={{ minHeight: "110px" }} />
                </FormLabel>
                <FormLabel label="Objetivo">
                  <textarea className="forge-textarea" value={factionGoal} onChange={(event) => setFactionGoal(event.target.value)} style={{ minHeight: "90px" }} />
                </FormLabel>
                <FormLabel label="Aliados">
                  <textarea className="forge-textarea" value={factionAllies} onChange={(event) => setFactionAllies(event.target.value)} style={{ minHeight: "80px" }} />
                </FormLabel>
                <FormLabel label="Inimigos">
                  <textarea className="forge-textarea" value={factionEnemies} onChange={(event) => setFactionEnemies(event.target.value)} style={{ minHeight: "80px" }} />
                </FormLabel>
                <FormLabel label="Situação atual">
                  <textarea className="forge-textarea" value={factionCurrentStatus} onChange={(event) => setFactionCurrentStatus(event.target.value)} style={{ minHeight: "90px" }} />
                </FormLabel>
                <FormLabel label="Segredo do Mestre">
                  <textarea className="forge-textarea" value={factionMasterSecret} onChange={(event) => setFactionMasterSecret(event.target.value)} style={{ minHeight: "90px" }} />
                </FormLabel>
                <button className="forge-button-primary" onClick={editorMode === "faction-create" ? handleCreateFaction : handleUpdateFaction} disabled={creatingFaction || savingFaction} style={{ opacity: creatingFaction || savingFaction ? 0.7 : 1 }}>
                  {editorMode === "faction-create" ? creatingFaction ? "Criando..." : "Registrar facção" : savingFaction ? "Gravando..." : "Atualizar facção"}
                </button>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function SectionHeader({
  kicker,
  title,
  text,
  actionLabel,
  onAction
}: {
  kicker: string;
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", marginBottom: "24px" }}>
      <div>
        <p className="forge-kicker">{kicker}</p>
        <h1 style={{ fontSize: "48px", lineHeight: 0.96, margin: "10px 0", letterSpacing: "-0.05em" }}>{title}</h1>
        <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: "720px", fontSize: "16px" }}>{text}</p>
      </div>
      <button className="forge-button-primary" onClick={onAction}>{actionLabel}</button>
    </div>
  );
}

function EmptyCard({
  title,
  text,
  actionLabel,
  onAction
}: {
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <article className="forge-card-accent" style={{ padding: "24px", gridColumn: "1 / -1", borderStyle: "dashed" }}>
      <p className="forge-kicker">Arquivo vazio</p>
      <h2 style={{ marginTop: "8px" }}>{title}</h2>
      <p className="forge-muted" style={{ lineHeight: 1.6 }}>{text}</p>
      <button className="forge-button-primary" onClick={onAction}>{actionLabel}</button>
    </article>
  );
}

function CardTitle({ kicker, title, badge }: { kicker: string; title: string; badge: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
      <div>
        <p className="forge-kicker">{kicker}</p>
        <h2 style={{ margin: "8px 0 10px", fontSize: "30px", letterSpacing: "-0.03em" }}>{title}</h2>
      </div>
      <span className="forge-status-pill">{badge}</span>
    </div>
  );
}

function LinkedListCard({ title, empty, items }: { title: string; empty: string; items: string[] }) {
  return (
    <div className="forge-card-accent" style={{ padding: "14px" }}>
      <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>{title}</p>
      {items.length === 0 ? (
        <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.5 }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
          {items.map((item) => <span key={item} className="forge-chip">{item}</span>)}
        </div>
      )}
    </div>
  );
}

function EditorHeader({ mode, onClose }: { mode: EditorMode; onClose: () => void }) {
  const title =
    mode === "scenario" ? "Editar cenário" :
    mode === "nation-create" ? "Erguer nação" :
    mode === "nation-edit" ? "Editar nação" :
    mode === "location-create" ? "Registrar local" :
    mode === "location-edit" ? "Editar local" :
    mode === "faction-create" ? "Criar facção" :
    "Editar facção";

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "18px" }}>
      <div>
        <p className="forge-kicker">Editor</p>
        <h2 style={{ margin: "8px 0 0" }}>{title}</h2>
      </div>
      <button className="forge-button-ghost" onClick={onClose}>Fechar</button>
    </div>
  );
}
