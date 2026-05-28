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

const quickActions = [
  ["+ Nação", "Reinos, impérios e povos"],
  ["+ Local", "Cidades, vilas e ruínas"],
  ["+ Facção", "Ordens, guildas e cultos"],
  ["+ Personagem", "NPCs importantes"],
  ["+ Segredo", "Notas privadas do mestre"],
  ["+ Gancho", "Ideias de aventura"]
];

const worldTree = ["Visão geral", "Nações", "Locais", "Facções", "Personagens", "Segredos"];

export function ScenarioClient({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [nations, setNations] = useState<Nation[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNationForm, setShowNationForm] = useState(false);
  const [creatingNation, setCreatingNation] = useState(false);
  const [deletingNationId, setDeletingNationId] = useState<string | null>(null);
  const [nationName, setNationName] = useState("");
  const [nationDescription, setNationDescription] = useState("");
  const [nationGovernmentType, setNationGovernmentType] = useState("");
  const [nationCapital, setNationCapital] = useState("");
  const [nationCulture, setNationCulture] = useState("");
  const [nationReligion, setNationReligion] = useState("");
  const [nationCurrentConflicts, setNationCurrentConflicts] = useState("");
  const [nationMasterSecret, setNationMasterSecret] = useState("");
  const [message, setMessage] = useState("");

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

  async function handleSave() {
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

    setNationName("");
    setNationDescription("");
    setNationGovernmentType("");
    setNationCapital("");
    setNationCulture("");
    setNationReligion("");
    setNationCurrentConflicts("");
    setNationMasterSecret("");
    setShowNationForm(false);
    setMessage("Nação registrada na Forja.");
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
    setMessage("Nação apagada da Forja.");
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: message.includes("Forja") ? "var(--forge-success)" : "var(--forge-muted)", fontSize: "14px" }}>{message || "Pronto para editar"}</span>
          <button onClick={handleSave} disabled={saving} className="forge-button-primary" style={{ opacity: saving ? 0.7 : 1 }}>{saving ? "Gravando..." : "Registrar na Forja"}</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "316px minmax(620px, 1fr) 322px", minHeight: "calc(100vh - 74px)" }}>
        <aside style={{ borderRight: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.58)" }}>
          <p className="forge-kicker">Árvore do mundo</p>
          <div className="forge-card-accent" style={{ padding: "18px", marginTop: "14px", marginBottom: "18px" }}>
            <strong style={{ display: "block", fontSize: "17px" }}>{scenario.name}</strong>
            <p className="forge-muted" style={{ lineHeight: 1.5, margin: "8px 0 0", fontSize: "14px" }}>A estrutura do mundo nasce aqui: nações, cidades, facções, personagens e segredos.</p>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {worldTree.map((item, index) => {
              const count = item === "Nações" ? nations.length : 0;
              return (
                <div key={item} className={index === 0 ? "forge-nav-item-active" : "forge-nav-item"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{index === 0 ? "▾" : "▸"} {item}</span>
                  {index > 0 ? <small style={{ color: "var(--forge-muted)" }}>{count}</small> : null}
                </div>
              );
            })}
          </div>

          <div style={{ border: "1px dashed rgba(197,124,38,0.42)", borderRadius: "22px", padding: "18px", background: "rgba(197,124,38,0.07)", marginTop: "22px" }}>
            <strong>{nations.length === 0 ? "Nenhuma nação ainda" : `${nations.length} nação${nations.length > 1 ? "ões" : ""} registrada${nations.length > 1 ? "s" : ""}`}</strong>
            <p className="forge-muted" style={{ lineHeight: 1.55, margin: "8px 0 14px", fontSize: "14px" }}>Nações organizam reinos, impérios, povos e culturas dentro do seu cenário.</p>
            <button className="forge-button-primary" style={{ width: "100%" }} onClick={() => setShowNationForm(true)}>Erguer nova nação</button>
          </div>
        </aside>

        <section style={{ padding: "34px", overflow: "auto" }}>
          <div style={{ maxWidth: "980px" }}>
            <p className="forge-kicker">Visão geral do cenário</p>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", marginTop: "10px", marginBottom: "26px" }}>
              <div>
                <h1 style={{ fontSize: "54px", lineHeight: 0.96, margin: 0, letterSpacing: "-0.06em" }}>{scenario.name}</h1>
                <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: "720px", fontSize: "16px" }}>Construa a crônica inicial, defina o tom da campanha e deixe pronto o esqueleto para nações, cidades e conflitos.</p>
              </div>
              <span className="forge-status-pill">Mundo forjado</span>
            </div>

            <div className="forge-panel" style={{ display: "grid", gap: "18px", padding: "26px" }}>
              <label>
                <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Nome público do cenário</span>
                <input className="forge-input" value={name} onChange={(event) => setName(event.target.value)} />
              </label>

              <label>
                <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Crônica inicial</span>
                <textarea className="forge-textarea" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex: Um arquipélago marcado por tempestades eternas, casas mercantis rivais e deuses antigos esquecidos sob o mar." style={{ minHeight: "190px" }} />
              </label>
            </div>

            <section className="forge-panel" style={{ padding: "26px", marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px" }}>
                <div>
                  <p className="forge-kicker">Nações & Reinos</p>
                  <h2 style={{ margin: "8px 0 8px" }}>Povos que moldam este mundo</h2>
                  <p className="forge-muted" style={{ lineHeight: 1.6, marginTop: 0 }}>Registre reinos, impérios, povos nômades, cidades-estado e culturas dominantes.</p>
                </div>
                <button className="forge-button-primary" onClick={() => setShowNationForm((current) => !current)}>{showNationForm ? "Fechar forja" : "+ Erguer Nação"}</button>
              </div>

              {showNationForm ? (
                <div className="forge-card-accent" style={{ padding: "18px", marginTop: "18px", display: "grid", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Nome da nação</span><input className="forge-input" value={nationName} onChange={(event) => setNationName(event.target.value)} placeholder="Ex: Reino de Aurel" /></label>
                    <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Capital</span><input className="forge-input" value={nationCapital} onChange={(event) => setNationCapital(event.target.value)} placeholder="Ex: Áurica" /></label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                    <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Tipo de governo</span><input className="forge-input" value={nationGovernmentType} onChange={(event) => setNationGovernmentType(event.target.value)} placeholder="Monarquia, teocracia..." /></label>
                    <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Cultura</span><input className="forge-input" value={nationCulture} onChange={(event) => setNationCulture(event.target.value)} placeholder="Tradições, costumes..." /></label>
                    <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Religião dominante</span><input className="forge-input" value={nationReligion} onChange={(event) => setNationReligion(event.target.value)} placeholder="Culto, panteão..." /></label>
                  </div>
                  <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Descrição</span><textarea className="forge-textarea" value={nationDescription} onChange={(event) => setNationDescription(event.target.value)} placeholder="Como essa nação é vista, como funciona e qual papel ela tem no mundo?" style={{ minHeight: "110px" }} /></label>
                  <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Conflitos atuais</span><textarea className="forge-textarea" value={nationCurrentConflicts} onChange={(event) => setNationCurrentConflicts(event.target.value)} placeholder="Guerras, disputas internas, crises sucessórias..." style={{ minHeight: "90px" }} /></label>
                  <label><span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Segredo do Mestre</span><textarea className="forge-textarea" value={nationMasterSecret} onChange={(event) => setNationMasterSecret(event.target.value)} placeholder="Algo que os jogadores ainda não sabem." style={{ minHeight: "90px" }} /></label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="forge-button-primary" onClick={handleCreateNation} disabled={creatingNation} style={{ opacity: creatingNation ? 0.7 : 1 }}>{creatingNation ? "Erguendo..." : "Registrar nação"}</button>
                    <button className="forge-button-ghost" onClick={() => setShowNationForm(false)}>Cancelar</button>
                  </div>
                </div>
              ) : null}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px", marginTop: "18px" }}>
                {nations.length === 0 ? (
                  <div className="forge-card" style={{ padding: "18px", gridColumn: "1 / -1" }}>
                    <strong>Nenhum reino se ergueu neste mundo ainda.</strong>
                    <p className="forge-muted" style={{ lineHeight: 1.6, marginBottom: 0 }}>Use o botão acima para criar a primeira nação do cenário.</p>
                  </div>
                ) : nations.map((nation) => (
                  <article key={nation.id} className="forge-card" style={{ padding: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ color: "var(--forge-gold-light)", fontSize: "12px", fontWeight: 850, letterSpacing: "0.12em", textTransform: "uppercase" }}>Nação registrada</span>
                        <h3 style={{ margin: "7px 0 8px", fontSize: "24px" }}>{nation.name}</h3>
                      </div>
                      <button type="button" onClick={() => handleDeleteNation(nation)} disabled={deletingNationId === nation.id} style={{ border: "1px solid rgba(248,113,113,0.38)", borderRadius: "999px", padding: "8px 11px", background: "rgba(127,29,29,0.24)", color: "var(--forge-danger)", fontWeight: 850, cursor: deletingNationId === nation.id ? "not-allowed" : "pointer", opacity: deletingNationId === nation.id ? 0.68 : 1 }}>{deletingNationId === nation.id ? "Apagando..." : "Apagar"}</button>
                    </div>
                    <p className="forge-muted-strong" style={{ lineHeight: 1.6 }}>{nation.description || "Sem descrição pública ainda."}</p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                      {nation.capital ? <span className="forge-chip">Capital: {nation.capital}</span> : null}
                      {nation.government_type ? <span className="forge-chip">{nation.government_type}</span> : null}
                      {nation.religion ? <span className="forge-chip">Religião: {nation.religion}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "22px" }}>
              {quickActions.map(([title, text]) => (
                <button key={title} className="forge-card" onClick={title === "+ Nação" ? () => setShowNationForm(true) : undefined} style={{ textAlign: "left", padding: "17px", color: "var(--forge-text)", cursor: "pointer" }}>
                  <strong style={{ display: "block" }}>{title}</strong>
                  <small className="forge-muted" style={{ display: "block", marginTop: "6px" }}>{text}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside style={{ borderLeft: "1px solid var(--forge-border)", padding: "24px", background: "rgba(2,6,23,0.54)" }}>
          <p className="forge-kicker">Painel do Mestre</p>
          <div style={{ display: "grid", gap: "14px", marginTop: "14px" }}>
            {[
              ["Status", "Em construção"],
              ["Nações", `${nations.length} criada${nations.length === 1 ? "" : "s"}`],
              ["Locais", "0 registrados"],
              ["Facções", "0 ativas"]
            ].map(([label, value]) => (
              <div key={label} className="forge-card" style={{ padding: "14px" }}>
                <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>{label}</p>
                <strong style={{ display: "block", marginTop: "5px" }}>{value}</strong>
              </div>
            ))}
          </div>

          <div className="forge-card-accent" style={{ marginTop: "22px", padding: "18px" }}>
            <strong style={{ color: "var(--forge-gold-light)" }}>Próxima etapa</strong>
            <p className="forge-muted" style={{ lineHeight: 1.55, fontSize: "14px" }}>Depois das nações, vamos permitir abrir uma nação específica e criar cidades, vilas e facções vinculadas a ela.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
