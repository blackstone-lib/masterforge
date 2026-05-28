"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

type ActiveSection = "overview" | "nations" | "locations" | "factions" | "characters" | "secrets";
type EditorMode = "scenario" | "nation-create" | "nation-edit" | null;

const sections: Array<{ id: ActiveSection; label: string }> = [
  { id: "overview", label: "Visão geral" },
  { id: "nations", label: "Nações" },
  { id: "locations", label: "Locais" },
  { id: "factions", label: "Facções" },
  { id: "characters", label: "Personagens" },
  { id: "secrets", label: "Segredos" }
];

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

export function ScenarioClient({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [nations, setNations] = useState<Nation[]>([]);
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingNationId, setEditingNationId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingNation, setCreatingNation] = useState(false);
  const [savingNation, setSavingNation] = useState(false);
  const [deletingNationId, setDeletingNationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [nationName, setNationName] = useState("");
  const [nationDescription, setNationDescription] = useState("");
  const [nationGovernmentType, setNationGovernmentType] = useState("");
  const [nationCapital, setNationCapital] = useState("");
  const [nationCulture, setNationCulture] = useState("");
  const [nationReligion, setNationReligion] = useState("");
  const [nationCurrentConflicts, setNationCurrentConflicts] = useState("");
  const [nationMasterSecret, setNationMasterSecret] = useState("");

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

      setScenario(data);
      setName(data.name);
      setDescription(data.description ?? "");
      setNations(nationsError ? [] : nationsData ?? []);
      setLoading(false);

      if (nationsError) {
        setMessage("Tabela de nações ainda não encontrada. Rode o SQL de criação no Supabase.");
      }
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

  function closeEditor() {
    setEditorMode(null);
    resetNationForm();
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
    if (editingNationId === nation.id) closeEditor();
    setMessage("Nação apagada da Forja.");
  }

  const sectionCount = (section: ActiveSection) => {
    if (section === "nations") return nations.length;
    return 0;
  };

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
        <span style={{ color: message.includes("Forja") ? "var(--forge-success)" : "var(--forge-muted)", fontSize: "14px" }}>{message || "Pronto para editar"}</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: editorMode ? "292px minmax(560px, 1fr) 420px" : "292px minmax(560px, 1fr)", minHeight: "calc(100vh - 74px)" }}>
        <aside style={{ borderRight: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.58)" }}>
          <p className="forge-kicker">Árvore do mundo</p>
          <div className="forge-card-accent" style={{ padding: "18px", marginTop: "14px", marginBottom: "18px" }}>
            <strong style={{ display: "block", fontSize: "17px" }}>{scenario.name}</strong>
            <p className="forge-muted" style={{ lineHeight: 1.5, margin: "8px 0 0", fontSize: "14px" }}>Abra uma seção para ver seus registros em cards. Edite apenas quando precisar.</p>
          </div>

          <nav style={{ display: "grid", gap: "10px" }}>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? "forge-nav-item-active" : "forge-nav-item"}
                onClick={() => setActiveSection(section.id)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "inherit", cursor: "pointer", textAlign: "left" }}
              >
                <span>{activeSection === section.id ? "▾" : "▸"} {section.label}</span>
                {section.id !== "overview" ? <small style={{ color: "var(--forge-muted)" }}>{sectionCount(section.id)}</small> : null}
              </button>
            ))}
          </nav>

          <div style={{ border: "1px dashed rgba(197,124,38,0.42)", borderRadius: "22px", padding: "18px", background: "rgba(197,124,38,0.07)", marginTop: "22px" }}>
            <strong>Forja rápida</strong>
            <p className="forge-muted" style={{ lineHeight: 1.55, margin: "8px 0 14px", fontSize: "14px" }}>Crie registros sem abrir formulários permanentes na tela.</p>
            <button className="forge-button-primary" style={{ width: "100%" }} onClick={openCreateNationEditor}>+ Erguer nação</button>
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
                    <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: "720px", fontSize: "16px" }}>Um resumo limpo do mundo, com edição aberta apenas quando necessário.</p>
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
                      <FieldView label="Locais" value="0 registrados" />
                      <FieldView label="Facções" value="0 ativas" />
                    </div>
                  </div>
                </article>
              </>
            ) : null}

            {activeSection === "nations" ? (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", marginBottom: "24px" }}>
                  <div>
                    <p className="forge-kicker">Nações & Reinos</p>
                    <h1 style={{ fontSize: "48px", lineHeight: 0.96, margin: "10px 0", letterSpacing: "-0.05em" }}>Povos que moldam este mundo</h1>
                    <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: "720px", fontSize: "16px" }}>Cada nação aparece como um card completo. O formulário só abre ao criar ou editar.</p>
                  </div>
                  <button className="forge-button-primary" onClick={openCreateNationEditor}>+ Erguer nova nação</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                  {nations.length === 0 ? (
                    <article className="forge-card-accent" style={{ padding: "24px", gridColumn: "1 / -1", borderStyle: "dashed" }}>
                      <p className="forge-kicker">Arquivo vazio</p>
                      <h2 style={{ marginTop: "8px" }}>Nenhum reino se ergueu neste mundo ainda.</h2>
                      <p className="forge-muted" style={{ lineHeight: 1.6 }}>Crie a primeira nação para começar a estruturar povos, capitais, culturas e conflitos.</p>
                      <button className="forge-button-primary" onClick={openCreateNationEditor}>Erguer primeira nação</button>
                    </article>
                  ) : nations.map((nation) => (
                    <article key={nation.id} className="forge-panel" style={{ padding: "22px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                        <div>
                          <p className="forge-kicker">Nação registrada</p>
                          <h2 style={{ margin: "8px 0 10px", fontSize: "30px", letterSpacing: "-0.03em" }}>{nation.name}</h2>
                        </div>
                        <span className="forge-status-pill">Nação</span>
                      </div>

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
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                        <button className="forge-button-primary" onClick={() => openEditNationEditor(nation)}>Editar</button>
                        <button type="button" onClick={() => handleDeleteNation(nation)} disabled={deletingNationId === nation.id} style={{ border: "1px solid rgba(248,113,113,0.38)", borderRadius: "999px", padding: "11px 16px", background: "rgba(127,29,29,0.24)", color: "var(--forge-danger)", fontWeight: 850, cursor: deletingNationId === nation.id ? "not-allowed" : "pointer", opacity: deletingNationId === nation.id ? 0.68 : 1 }}>{deletingNationId === nation.id ? "Apagando..." : "Apagar"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}

            {["locations", "factions", "characters", "secrets"].includes(activeSection) ? (
              <article className="forge-card-accent" style={{ padding: "30px", borderStyle: "dashed" }}>
                <p className="forge-kicker">Em breve</p>
                <h1 style={{ marginTop: "8px" }}>{sections.find((section) => section.id === activeSection)?.label}</h1>
                <p className="forge-muted" style={{ lineHeight: 1.6, maxWidth: "620px" }}>Essa seção seguirá o mesmo padrão: cards de leitura e edição sob demanda.</p>
              </article>
            ) : null}
          </div>
        </section>

        {editorMode ? (
          <aside style={{ borderLeft: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.72)", position: "sticky", top: "74px", height: "calc(100vh - 74px)", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "18px" }}>
              <div>
                <p className="forge-kicker">Editor</p>
                <h2 style={{ margin: "8px 0 0" }}>{editorMode === "scenario" ? "Editar cenário" : editorMode === "nation-create" ? "Erguer nação" : "Editar nação"}</h2>
              </div>
              <button className="forge-button-ghost" onClick={closeEditor}>Fechar</button>
            </div>

            {editorMode === "scenario" ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Nome público do cenário</span><input className="forge-input" value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Crônica inicial</span><textarea className="forge-textarea" value={description} onChange={(event) => setDescription(event.target.value)} style={{ minHeight: "180px" }} /></label>
                <button className="forge-button-primary" onClick={handleSaveScenario} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>{saving ? "Gravando..." : "Registrar na Forja"}</button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Nome da nação</span><input className="forge-input" value={nationName} onChange={(event) => setNationName(event.target.value)} placeholder="Ex: Reino de Aurel" /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Capital</span><input className="forge-input" value={nationCapital} onChange={(event) => setNationCapital(event.target.value)} placeholder="Ex: Áurica" /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Tipo de governo</span><input className="forge-input" value={nationGovernmentType} onChange={(event) => setNationGovernmentType(event.target.value)} placeholder="Monarquia, teocracia..." /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Cultura</span><input className="forge-input" value={nationCulture} onChange={(event) => setNationCulture(event.target.value)} placeholder="Tradições, costumes..." /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Religião dominante</span><input className="forge-input" value={nationReligion} onChange={(event) => setNationReligion(event.target.value)} placeholder="Culto, panteão..." /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Descrição</span><textarea className="forge-textarea" value={nationDescription} onChange={(event) => setNationDescription(event.target.value)} style={{ minHeight: "110px" }} /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Conflitos atuais</span><textarea className="forge-textarea" value={nationCurrentConflicts} onChange={(event) => setNationCurrentConflicts(event.target.value)} style={{ minHeight: "90px" }} /></label>
                <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Segredo do Mestre</span><textarea className="forge-textarea" value={nationMasterSecret} onChange={(event) => setNationMasterSecret(event.target.value)} style={{ minHeight: "90px" }} /></label>
                <button className="forge-button-primary" onClick={editorMode === "nation-create" ? handleCreateNation : handleUpdateNation} disabled={creatingNation || savingNation} style={{ opacity: creatingNation || savingNation ? 0.7 : 1 }}>{editorMode === "nation-create" ? creatingNation ? "Erguendo..." : "Registrar nação" : savingNation ? "Gravando..." : "Atualizar nação"}</button>
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </main>
  );
}
