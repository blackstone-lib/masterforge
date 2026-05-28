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
  ["+ Nacao", "Reinos, imperios e povos"],
  ["+ Local", "Cidades, vilas e ruinas"],
  ["+ Faccao", "Ordens, guildas e cultos"],
  ["+ Personagem", "NPCs importantes"],
  ["+ Segredo", "Notas privadas do mestre"],
  ["+ Gancho", "Ideias de aventura"]
];

const worldTree = ["Visao geral", "Nacoes", "Locais", "Faccoes", "Personagens", "Segredos"];

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
        setMessage("Cenario nao encontrado ou sem permissao de acesso.");
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
      setMessage("O nome do cenario nao pode ficar vazio.");
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
    setMessage("Alteracoes salvas com sucesso.");
  }

  const pageBackground = "radial-gradient(circle at 16% 0%, rgba(245,158,11,0.15), transparent 24rem), radial-gradient(circle at 85% 12%, rgba(127,29,29,0.12), transparent 26rem), linear-gradient(135deg, #050505, #0b1020 48%, #111827)";

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: pageBackground, color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div style={{ border: "1px solid rgba(245,158,11,0.26)", borderRadius: "28px", padding: "30px", background: "rgba(15,23,42,0.82)", boxShadow: "0 24px 80px rgba(0,0,0,0.32)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 900, margin: 0, letterSpacing: "0.16em", textTransform: "uppercase" }}>Master Forge</p>
          <h1 style={{ marginBottom: 0 }}>Abrindo seu grimorio...</h1>
        </div>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: pageBackground, color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <section style={{ border: "1px solid rgba(248,113,113,0.3)", borderRadius: "28px", padding: "30px", background: "rgba(127,29,29,0.18)", maxWidth: "560px" }}>
          <p style={{ color: "#fca5a5", fontWeight: 900, marginTop: 0, letterSpacing: "0.14em", textTransform: "uppercase" }}>Acesso negado</p>
          <h1>Cenario nao encontrado</h1>
          <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{message}</p>
          <Link href="/dashboard" style={{ color: "#111827", textDecoration: "none", display: "inline-block", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", padding: "12px 18px", borderRadius: "999px", fontWeight: 900 }}>Voltar ao dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: pageBackground, color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <header style={{ height: "74px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid rgba(148,163,184,0.16)", background: "rgba(2,6,23,0.78)", backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Link href="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>← Arquivo dos Reinos</Link>
          <span style={{ width: "1px", height: "28px", background: "rgba(148,163,184,0.22)" }} />
          <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Master Forge</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: message.includes("sucesso") ? "#86efac" : "#94a3b8", fontSize: "14px" }}>{message || "Pronto para editar"}</span>
          <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "12px 18px", borderRadius: "999px", fontWeight: 950, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Salvando..." : "Salvar alteracoes"}</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "316px minmax(620px, 1fr) 322px", minHeight: "calc(100vh - 74px)" }}>
        <aside style={{ borderRight: "1px solid rgba(148,163,184,0.16)", padding: "24px", background: "rgba(2,6,23,0.58)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 0, fontSize: "13px" }}>Arvore do mundo</p>
          <div style={{ border: "1px solid rgba(245,158,11,0.26)", borderRadius: "24px", padding: "18px", background: "rgba(245,158,11,0.06)", marginBottom: "18px" }}>
            <strong style={{ display: "block", fontSize: "17px" }}>{scenario.name}</strong>
            <p style={{ color: "#94a3b8", lineHeight: 1.5, margin: "8px 0 0", fontSize: "14px" }}>A estrutura do mundo vai nascer aqui: nacoes, cidades, faccoes, personagens e segredos.</p>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {worldTree.map((item, index) => (
              <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 13px", borderRadius: "16px", background: index === 0 ? "rgba(245,158,11,0.14)" : "rgba(15,23,42,0.66)", border: `1px solid ${index === 0 ? "rgba(245,158,11,0.26)" : "rgba(148,163,184,0.16)"}`, color: index === 0 ? "#fbbf24" : "#cbd5e1" }}>
                <span>{index === 0 ? "▾" : "▸"} {item}</span>
                {index > 0 ? <small style={{ color: "#94a3b8" }}>0</small> : null}
              </div>
            ))}
          </div>

          <div style={{ border: "1px dashed rgba(245,158,11,0.34)", borderRadius: "22px", padding: "18px", background: "rgba(245,158,11,0.05)", marginTop: "22px" }}>
            <strong>Nenhuma nacao ainda</strong>
            <p style={{ color: "#94a3b8", lineHeight: 1.55, margin: "8px 0 14px", fontSize: "14px" }}>Nacoes organizam reinos, imperios, povos e culturas dentro do seu cenario.</p>
            <button style={{ width: "100%", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "12px", borderRadius: "999px", fontWeight: 950, cursor: "pointer" }}>Criar primeira nacao</button>
          </div>
        </aside>

        <section style={{ padding: "34px", overflow: "auto" }}>
          <div style={{ maxWidth: "980px" }}>
            <p style={{ color: "#f59e0b", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, fontSize: "13px" }}>Visao geral do cenario</p>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", marginTop: "10px", marginBottom: "26px" }}>
              <div>
                <h1 style={{ fontSize: "54px", lineHeight: 0.96, margin: 0, letterSpacing: "-0.06em" }}>{scenario.name}</h1>
                <p style={{ color: "#94a3b8", lineHeight: 1.65, maxWidth: "720px", fontSize: "16px" }}>Construa a premissa do mundo, defina o tom da campanha e deixe pronto o esqueleto para nacoes, cidades e conflitos.</p>
              </div>
              <span style={{ color: "#fbbf24", border: "1px solid rgba(245,158,11,0.26)", borderRadius: "999px", padding: "9px 12px", background: "rgba(245,158,11,0.08)", whiteSpace: "nowrap", fontSize: "13px", fontWeight: 850 }}>Cenario pessoal</span>
            </div>

            <div style={{ display: "grid", gap: "18px", border: "1px solid rgba(148,163,184,0.16)", borderRadius: "30px", padding: "26px", background: "linear-gradient(180deg, rgba(17,24,39,0.94), rgba(10,16,30,0.86))", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
              <label>
                <span style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>Nome publico do cenario</span>
                <input value={name} onChange={(event) => setName(event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none", fontSize: "15px" }} />
              </label>

              <label>
                <span style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>Premissa do mundo</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex: Um arquipelago marcado por tempestades eternas, casas mercantis rivais e deuses antigos esquecidos sob o mar." style={{ width: "100%", boxSizing: "border-box", minHeight: "190px", padding: "15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none", resize: "vertical", lineHeight: 1.6 }} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "22px" }}>
              {quickActions.map(([title, text]) => (
                <button key={title} style={{ textAlign: "left", border: "1px solid rgba(148,163,184,0.16)", borderRadius: "20px", padding: "17px", background: "rgba(15,23,42,0.62)", color: "#f8fafc", cursor: "pointer" }}>
                  <strong style={{ display: "block" }}>{title}</strong>
                  <small style={{ color: "#94a3b8", display: "block", marginTop: "6px" }}>{text}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside style={{ borderLeft: "1px solid rgba(148,163,184,0.16)", padding: "24px", background: "rgba(2,6,23,0.54)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 0, fontSize: "13px" }}>Painel do mestre</p>
          <div style={{ display: "grid", gap: "14px" }}>
            {[
              ["Status", "Em construcao"],
              ["Nacoes", "0 criadas"],
              ["Locais", "0 registrados"],
              ["Faccoes", "0 ativas"]
            ].map(([label, value]) => (
              <div key={label} style={{ border: "1px solid rgba(148,163,184,0.16)", borderRadius: "18px", padding: "14px", background: "rgba(15,23,42,0.72)" }}>
                <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>{label}</p>
                <strong style={{ display: "block", marginTop: "5px" }}>{value}</strong>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "22px", border: "1px solid rgba(245,158,11,0.26)", borderRadius: "24px", padding: "18px", background: "rgba(245,158,11,0.07)" }}>
            <strong style={{ color: "#fbbf24" }}>Proxima etapa</strong>
            <p style={{ color: "#94a3b8", lineHeight: 1.55, fontSize: "14px" }}>Transformar a arvore do mundo em dados reais: primeiro nacoes, depois locais e faccoes.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
