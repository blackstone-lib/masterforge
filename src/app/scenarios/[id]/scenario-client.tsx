"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
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

type ActiveSection =
  | "overview"
  | "nations"
  | "settlements"
  | "locations"
  | "factions"
  | "characters"
  | "timeline_events"
  | "lore_entries";

type EntitySection = Exclude<ActiveSection, "overview">;
type EditorMode = "scenario" | "entity-create" | "entity-edit" | null;
type EntityRecord = Record<string, unknown> & {
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

type SectionConfig = {
  id: EntitySection;
  label: string;
  table: string;
  titleField: "name" | "title";
  createLabel: string;
  emptyTitle: string;
  emptyText: string;
  fields: string[];
  relations?: Array<"nation_id" | "location_id">;
};

const sectionConfigs: Record<EntitySection, SectionConfig> = {
  nations: {
    id: "nations",
    label: "Nações",
    table: "nations",
    titleField: "name",
    createLabel: "Fundar nação",
    emptyTitle: "Nenhuma bandeira foi erguida.",
    emptyText: "Crie a primeira nação deste cenário para organizar política, cultura e conflitos.",
    fields: ["name", "description", "government_type", "capital", "culture", "religion", "current_conflicts", "master_secret"]
  },
  settlements: {
    id: "settlements",
    label: "Assentamentos",
    table: "settlements",
    titleField: "name",
    createLabel: "Criar assentamento",
    emptyTitle: "Nenhum assentamento registrado.",
    emptyText: "Cidades, vilas, capitais e povoados aparecerão aqui.",
    fields: ["name", "type", "description", "population", "government", "economy", "notable_places", "importance", "current_situation", "master_secret"]
  },
  locations: {
    id: "locations",
    label: "Locais",
    table: "locations",
    titleField: "name",
    createLabel: "Registrar local",
    emptyTitle: "O mapa ainda está em branco.",
    emptyText: "Registre templos, fortalezas, ruínas, cidades especiais e pontos de interesse.",
    fields: ["name", "type", "description", "population", "ruler", "importance", "current_situation", "master_secret"],
    relations: ["nation_id"]
  },
  factions: {
    id: "factions",
    label: "Facções",
    table: "factions",
    titleField: "name",
    createLabel: "Criar facção",
    emptyTitle: "Nenhuma sombra se move ainda.",
    emptyText: "Crie guildas, cultos, ordens, casas nobres e sociedades secretas.",
    fields: ["name", "type", "description", "goal", "leader", "allies", "enemies", "influence_level", "current_status", "master_secret"],
    relations: ["nation_id", "location_id"]
  },
  characters: {
    id: "characters",
    label: "Personagens",
    table: "characters",
    titleField: "name",
    createLabel: "Criar personagem",
    emptyTitle: "Nenhum personagem registrado.",
    emptyText: "Crie NPCs, aliados, antagonistas e figuras importantes do cenário.",
    fields: ["name", "title", "type", "race", "class_role", "description", "personality", "background", "goals", "secrets"]
  },
  timeline_events: {
    id: "timeline_events",
    label: "Linha do tempo",
    table: "timeline_events",
    titleField: "title",
    createLabel: "Criar evento",
    emptyTitle: "Nenhum evento histórico registrado.",
    emptyText: "Registre eras, guerras, rituais, catástrofes e consequências do mundo.",
    fields: ["title", "event_type", "date_label", "era", "year", "description", "causes", "consequences", "outcome", "secrets"]
  },
  lore_entries: {
    id: "lore_entries",
    label: "Lore",
    table: "lore_entries",
    titleField: "title",
    createLabel: "Criar lore",
    emptyTitle: "Nenhuma entrada de lore registrada.",
    emptyText: "Crie mitos, religiões, lendas, rumores e notas profundas do cenário.",
    fields: ["title", "category", "summary", "content", "origin", "importance", "rumors", "adventure_hooks", "master_notes"]
  }
};

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

const labels: Record<string, string> = {
  name: "Nome",
  title: "Título",
  type: "Tipo",
  category: "Categoria",
  event_type: "Tipo de evento",
  description: "Descrição",
  summary: "Resumo",
  content: "Conteúdo",
  government_type: "Tipo de governo",
  capital: "Capital",
  culture: "Cultura",
  religion: "Religião",
  current_conflicts: "Conflitos atuais",
  population: "População",
  government: "Governo",
  economy: "Economia",
  notable_places: "Pontos notáveis",
  ruler: "Governante",
  importance: "Importância",
  current_situation: "Situação atual",
  goal: "Objetivo",
  leader: "Líder",
  allies: "Aliados",
  enemies: "Inimigos",
  influence_level: "Influência",
  current_status: "Status atual",
  race: "Raça",
  class_role: "Função",
  personality: "Personalidade",
  background: "Histórico",
  goals: "Objetivos",
  date_label: "Data",
  era: "Era",
  year: "Ano",
  causes: "Causas",
  consequences: "Consequências",
  outcome: "Resultado",
  origin: "Origem",
  rumors: "Rumores",
  adventure_hooks: "Ganchos de aventura",
  master_notes: "Notas do mestre",
  master_secret: "Segredo do mestre",
  secrets: "Segredos",
  nation_id: "Nação vinculada",
  location_id: "Local vinculado"
};

const longFields = new Set([
  "description",
  "culture",
  "current_conflicts",
  "master_secret",
  "notable_places",
  "importance",
  "current_situation",
  "goal",
  "allies",
  "enemies",
  "personality",
  "background",
  "goals",
  "secrets",
  "causes",
  "consequences",
  "outcome",
  "summary",
  "content",
  "rumors",
  "adventure_hooks",
  "master_notes"
]);

function emptyRows(): Record<EntitySection, EntityRecord[]> {
  return {
    nations: [],
    settlements: [],
    locations: [],
    factions: [],
    characters: [],
    timeline_events: [],
    lore_entries: []
  };
}

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "Não definido";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function titleOf(item: EntityRecord, config: SectionConfig) {
  return item[config.titleField] || item.name || item.title || "Registro sem nome";
}

function FormLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: 8, fontSize: 14 }}>{label}</span>
      {children}
    </label>
  );
}

function FieldCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="forge-card" style={{ padding: 14 }}>
      <p className="forge-muted" style={{ margin: 0, fontSize: 13 }}>{label}</p>
      <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.55 }}>{valueText(value)}</p>
    </div>
  );
}

function EmptyBox({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <section className="forge-card-accent" style={{ borderStyle: "dashed", padding: 30 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="forge-muted" style={{ lineHeight: 1.6 }}>{text}</p>
      {actionLabel && onAction ? <button className="forge-button-primary" onClick={onAction}>{actionLabel}</button> : null}
    </section>
  );
}

function DangerButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid rgba(248,113,113,0.38)",
        borderRadius: 999,
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
  const [rows, setRows] = useState<Record<EntitySection, EntityRecord[]>>(emptyRows());
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingSection, setEditingSection] = useState<EntitySection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

      const nextRows = emptyRows();
      const results = await Promise.all(
        (Object.keys(sectionConfigs) as EntitySection[]).map(async (section) => {
          const config = sectionConfigs[section];
          const result = await supabase
            .from(config.table)
            .select("*")
            .eq("scenario_id", scenarioData.id)
            .order("created_at", { ascending: false });

          return { section, result };
        })
      );

      let firstError = "";
      for (const { section, result } of results) {
        nextRows[section] = (result.data ?? []) as EntityRecord[];
        if (!firstError && result.error) firstError = result.error.message;
      }

      setScenario(scenarioData);
      setScenarioName(scenarioData.name);
      setScenarioDescription(scenarioData.description ?? "");
      setRows(nextRows);
      if (firstError) setMessage(firstError);
      setLoading(false);
    }

    loadScenario();
  }, [router, scenarioId]);

  function sectionCount(section: ActiveSection) {
    if (section === "overview") return null;
    return rows[section].length;
  }

  function changeSection(section: ActiveSection) {
    if (activeSection !== section) closeEditor();
    setActiveSection(section);
  }

  function closeEditor() {
    setEditorMode(null);
    setEditingSection(null);
    setEditingId(null);
    setFormData({});
  }

  function updateField(field: string, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function buildInitialData(section: EntitySection, item?: EntityRecord, extra?: Record<string, string>) {
    const config = sectionConfigs[section];
    const data: Record<string, string> = {};

    for (const field of config.fields) data[field] = item ? valueText(item[field]) === "Não definido" ? "" : valueText(item[field]) : "";
    for (const relation of config.relations ?? []) data[relation] = item ? String(item[relation] ?? "") : "";

    return { ...data, ...(extra ?? {}) };
  }

  function openCreate(section: EntitySection, extra?: Record<string, string>) {
    setActiveSection(section);
    setEditingSection(section);
    setEditingId(null);
    setFormData(buildInitialData(section, undefined, extra));
    setEditorMode("entity-create");
  }

  function openEdit(section: EntitySection, item: EntityRecord) {
    setActiveSection(section);
    setEditingSection(section);
    setEditingId(item.id);
    setFormData(buildInitialData(section, item));
    setEditorMode("entity-edit");
  }

  async function saveScenario() {
    if (!scenario || !scenarioName.trim()) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("scenarios")
      .update({
        name: scenarioName.trim(),
        description: scenarioDescription.trim(),
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
    closeEditor();
    setMessage("Cenário gravado na Forja.");
  }

  async function saveEntity() {
    if (!scenario || !editingSection) return;

    const config = sectionConfigs[editingSection];
    const titleField = config.titleField;

    if (!formData[titleField]?.trim()) {
      setMessage(`Preencha o campo ${labels[titleField]}.`);
      return;
    }

    const payload: Record<string, string | null> = {};

    for (const field of config.fields) payload[field] = formData[field]?.trim() ?? "";
    for (const relation of config.relations ?? []) payload[relation] = formData[relation] || null;

    setSaving(true);
    setMessage("");

    const query = editorMode === "entity-create"
      ? supabase.from(config.table).insert({ scenario_id: scenario.id, ...payload }).select("*").single()
      : supabase.from(config.table).update(payload).eq("id", editingId).eq("scenario_id", scenario.id).select("*").single();

    const { data, error } = await query;

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((current) => ({
      ...current,
      [editingSection]: editorMode === "entity-create"
        ? [data as EntityRecord, ...current[editingSection]]
        : current[editingSection].map((item) => item.id === data.id ? data as EntityRecord : item)
    }));

    closeEditor();
    setMessage(`${config.label.slice(0, -1) || config.label} gravado na Forja.`);
  }

  async function deleteEntity(section: EntitySection, item: EntityRecord) {
    if (!scenario) return;
    const config = sectionConfigs[section];
    const label = String(titleOf(item, config));

    if (!window.confirm(`Apagar "${label}"? Esta ação não pode ser desfeita.`)) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from(config.table)
      .delete()
      .eq("id", item.id)
      .eq("scenario_id", scenario.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((current) => ({
      ...current,
      [section]: current[section].filter((row) => row.id !== item.id)
    }));

    if (editingId === item.id) closeEditor();
    setMessage(`${config.label.slice(0, -1) || config.label} apagado da Forja.`);
  }

  function relationName(relation: "nation_id" | "location_id", value: unknown) {
    if (!value) return "";

    if (relation === "nation_id") {
      const nation = rows.nations.find((item) => item.id === value);
      return nation ? String(nation.name ?? "Nação vinculada") : "Nação vinculada";
    }

    const location = rows.locations.find((item) => item.id === value);
    return location ? String(location.name ?? "Local vinculado") : "Local vinculado";
  }

  function renderEntitySection(section: EntitySection) {
    const config = sectionConfigs[section];
    const sectionRows = rows[section];

    if (sectionRows.length === 0) {
      return (
        <EmptyBox
          title={config.emptyTitle}
          text={config.emptyText}
          actionLabel={config.createLabel}
          onAction={() => openCreate(section)}
        />
      );
    }

    return (
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0 }}>{config.label}</h2>
          <button className="forge-button-primary" onClick={() => openCreate(section)}>+ {config.createLabel}</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          {sectionRows.map((item) => {
            const filledFields = config.fields.filter((field) => item[field] !== null && item[field] !== undefined && item[field] !== "");

            return (
              <article key={item.id} className="forge-panel" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
                  <div>
                    <p className="forge-kicker">{config.label.slice(0, -1) || "Registro"}</p>
                    <h2 style={{ margin: "6px 0 12px" }}>{titleOf(item, config)}</h2>
                  </div>
                  {(item.type || item.category || item.event_type) ? (
                    <span className="forge-status-pill">{String(item.type || item.category || item.event_type)}</span>
                  ) : null}
                </div>

                {(config.relations ?? []).length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {(config.relations ?? []).map((relation) => item[relation] ? (
                      <span key={relation} className="forge-chip">{relationName(relation, item[relation])}</span>
                    ) : null)}
                  </div>
                ) : null}

                {filledFields.length === 0 ? (
                  <p className="forge-muted">Este registro ainda não possui campos narrativos preenchidos.</p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {filledFields.slice(0, 4).map((field) => (
                      <FieldCard key={field} label={labels[field] ?? field} value={item[field]} />
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button className="forge-button-ghost" onClick={() => openEdit(section, item)}>Editar</button>

                  {section === "nations" ? (
                    <>
                      <button className="forge-button-ghost" onClick={() => openCreate("locations", { nation_id: item.id })}>Novo local</button>
                      <button className="forge-button-ghost" onClick={() => openCreate("factions", { nation_id: item.id })}>Nova facção</button>
                    </>
                  ) : null}

                  {section === "locations" ? (
                    <button className="forge-button-ghost" onClick={() => openCreate("factions", { nation_id: String(item.nation_id ?? ""), location_id: item.id })}>Nova facção</button>
                  ) : null}

                  <DangerButton onClick={() => deleteEntity(section, item)} disabled={saving}>Apagar</DangerButton>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section className="forge-card-accent" style={{ padding: 30 }}>
          <p className="forge-kicker">Master Forge</p>
          <h1>Abrindo cenário...</h1>
        </section>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section className="forge-card-accent" style={{ padding: 30 }}>
          <h1>Cenário não encontrado</h1>
          <p className="forge-muted">{message}</p>
          <Link href="/dashboard" className="forge-link-primary">Voltar</Link>
        </section>
      </main>
    );
  }

  const stats = (Object.keys(sectionConfigs) as EntitySection[]).map((section) => [sectionConfigs[section].label, rows[section].length] as const);

  return (
    <main className="forge-page" style={{ display: "grid", gridTemplateColumns: "292px minmax(620px, 1fr) 420px", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid var(--forge-border)", padding: 24, background: "rgba(2,6,23,0.58)" }}>
        <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none", display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}>
          <span className="forge-mark">MF</span>
          <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>

        <div className="forge-card-accent" style={{ padding: 18, marginBottom: 18 }}>
          <p className="forge-kicker">Cenário ativo</p>
          <strong style={{ display: "block", fontSize: 20, marginTop: 8 }}>{scenario.name}</strong>
        </div>

        <nav style={{ display: "grid", gap: 10 }}>
          {sections.map((section) => {
            const count = sectionCount(section.id);
            return (
              <button
                key={section.id}
                className={activeSection === section.id ? "forge-nav-item-active" : "forge-nav-item"}
                onClick={() => changeSection(section.id)}
                style={{ display: "flex", justifyContent: "space-between", color: "inherit", cursor: "pointer", textAlign: "left" }}
              >
                <span>{section.label}</span>
                {count !== null ? <small>{count}</small> : null}
              </button>
            );
          })}
        </nav>

        <Link href={`/scenarios/${scenario.id}/atlas`} className="forge-link-pill" style={{ marginTop: 22, textAlign: "center" }}>Abrir modo Atlas</Link>
      </aside>

      <section style={{ padding: 34, overflow: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 26 }}>
          <div>
            <p className="forge-kicker">Mesa do Mestre</p>
            <h1 style={{ fontSize: 52, lineHeight: 0.96, margin: "10px 0", letterSpacing: "-0.05em" }}>{scenario.name}</h1>
            <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: 720 }}>{scenario.description || "Sem crônica inicial ainda."}</p>
          </div>
          <button
            className="forge-button-ghost"
            onClick={() => {
              setScenarioName(scenario.name);
              setScenarioDescription(scenario.description ?? "");
              setEditorMode("scenario");
            }}
          >
            Editar cenário
          </button>
        </header>

        {message ? <p style={{ color: message.includes("Forja") ? "var(--forge-success)" : "var(--forge-danger)", lineHeight: 1.5 }}>{message}</p> : null}

        {activeSection === "overview" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              {stats.map(([label, value]) => (
                <div key={label} className="forge-card" style={{ padding: 18 }}>
                  <p className="forge-muted" style={{ margin: 0 }}>{label}</p>
                  <strong style={{ display: "block", fontSize: 32, marginTop: 6 }}>{value}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {(Object.keys(sectionConfigs) as EntitySection[]).map((section) => (
                <button key={section} className="forge-card-accent" onClick={() => openCreate(section)} style={{ padding: 22, color: "inherit", cursor: "pointer", textAlign: "left" }}>
                  <p className="forge-kicker">{sectionConfigs[section].label}</p>
                  <h2>{sectionConfigs[section].createLabel}</h2>
                  <p className="forge-muted">Adicionar novo registro neste módulo.</p>
                </button>
              ))}
            </div>
          </>
        ) : renderEntitySection(activeSection)}
      </section>

      <aside style={{ borderLeft: "1px solid var(--forge-border)", padding: 24, background: "rgba(2,6,23,0.42)", overflow: "auto" }}>
        {!editorMode ? (
          <section className="forge-card-accent" style={{ padding: 20 }}>
            <p className="forge-kicker">Painel de edição</p>
            <h2 style={{ margin: "8px 0" }}>Selecione uma ação</h2>
            <p className="forge-muted" style={{ lineHeight: 1.6 }}>Todos os módulos principais do cenário agora podem ser criados, editados e apagados por aqui.</p>
          </section>
        ) : null}

        {editorMode === "scenario" ? (
          <section className="forge-panel" style={{ padding: 22 }}>
            <p className="forge-kicker">Cenário</p>
            <h2>Editar cenário</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <FormLabel label="Nome"><input className="forge-input" value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} /></FormLabel>
              <FormLabel label="Crônica"><textarea className="forge-textarea" value={scenarioDescription} onChange={(event) => setScenarioDescription(event.target.value)} /></FormLabel>
              <button className="forge-button-primary" onClick={saveScenario} disabled={saving}>{saving ? "Gravando..." : "Gravar"}</button>
              <button className="forge-button-ghost" onClick={closeEditor}>Cancelar</button>
            </div>
          </section>
        ) : null}

        {(editorMode === "entity-create" || editorMode === "entity-edit") && editingSection ? (
          <section className="forge-panel" style={{ padding: 22 }}>
            <p className="forge-kicker">{sectionConfigs[editingSection].label}</p>
            <h2>{editorMode === "entity-create" ? sectionConfigs[editingSection].createLabel : `Editar ${sectionConfigs[editingSection].label.slice(0, -1).toLowerCase()}`}</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {(sectionConfigs[editingSection].relations ?? []).map((relation) => (
                <FormLabel key={relation} label={labels[relation]}>
                  <select className="forge-input" value={formData[relation] ?? ""} onChange={(event) => updateField(relation, event.target.value)}>
                    <option value="">Nenhum</option>
                    {relation === "nation_id" ? rows.nations.map((item) => <option key={item.id} value={item.id}>{String(item.name ?? "Nação sem nome")}</option>) : null}
                    {relation === "location_id" ? rows.locations.map((item) => <option key={item.id} value={item.id}>{String(item.name ?? "Local sem nome")}</option>) : null}
                  </select>
                </FormLabel>
              ))}

              {sectionConfigs[editingSection].fields.map((field) => (
                <FormLabel key={field} label={labels[field] ?? field}>
                  {longFields.has(field) ? (
                    <textarea className="forge-textarea" value={formData[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} />
                  ) : (
                    <input className="forge-input" value={formData[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} />
                  )}
                </FormLabel>
              ))}

              <button className="forge-button-primary" onClick={saveEntity} disabled={saving}>{saving ? "Gravando..." : "Gravar"}</button>
              <button className="forge-button-ghost" onClick={closeEditor}>Cancelar</button>
            </div>
          </section>
        ) : null}
      </aside>
    </main>
  );
}
