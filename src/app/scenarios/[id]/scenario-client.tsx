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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

      setScenario(data);
      setName(data.name);
      setDescription(data.description ?? "");
      setLoading(false);
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
            {worldTree.map((item, index) => (
              <div key={item} className={index === 0 ? "forge-nav-item-active" : "forge-nav-item"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{index === 0 ? "▾" : "▸"} {item}</span>
                {index > 0 ? <small style={{ color: "var(--forge-muted)" }}>0</small> : null}
              </div>
            ))}
          </div>

          <div style={{ border: "1px dashed rgba(197,124,38,0.42)", borderRadius: "22px", padding: "18px", background: "rgba(197,124,38,0.07)", marginTop: "22px" }}>
            <strong>Nenhuma nação ainda</strong>
            <p className="forge-muted" style={{ lineHeight: 1.55, margin: "8px 0 14px", fontSize: "14px" }}>Nações organizam reinos, impérios, povos e culturas dentro do seu cenário.</p>
            <button className="forge-button-primary" style={{ width: "100%" }}>Erguer primeira nação</button>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "22px" }}>
              {quickActions.map(([title, text]) => (
                <button key={title} className="forge-card" style={{ textAlign: "left", padding: "17px", color: "var(--forge-text)", cursor: "pointer" }}>
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
              ["Nações", "0 criadas"],
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
            <p className="forge-muted" style={{ lineHeight: 1.55, fontSize: "14px" }}>Transformar a árvore do mundo em dados reais: primeiro nações, depois locais e facções.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
