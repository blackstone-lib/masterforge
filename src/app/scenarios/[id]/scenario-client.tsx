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

const nations = [
  {
    name: "Nenhuma nacao criada ainda",
    type: "Comece criando a primeira nacao",
    children: ["Cidades", "Vilas", "Faccoes locais"]
  }
];

const quickActions = ["+ Cidade", "+ Vila", "+ Faccao", "+ Personagem", "+ Religiao", "+ Segredo"];

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

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #050505, #0f172a 58%, #111827)", color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div style={{ border: "1px solid rgba(245,158,11,0.22)", borderRadius: "26px", padding: "28px", background: "rgba(15,23,42,0.76)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 800, margin: 0 }}>Master Forge</p>
          <h1 style={{ marginBottom: 0 }}>Carregando cenario...</h1>
        </div>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #050505, #0f172a 58%, #111827)", color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <section style={{ border: "1px solid rgba(248,113,113,0.3)", borderRadius: "26px", padding: "28px", background: "rgba(127,29,29,0.18)", maxWidth: "520px" }}>
          <p style={{ color: "#fca5a5", fontWeight: 800, marginTop: 0 }}>Acesso negado</p>
          <h1>Cenario nao encontrado</h1>
          <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{message}</p>
          <Link href="/dashboard" style={{ color: "#111827", textDecoration: "none", display: "inline-block", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", padding: "12px 18px", borderRadius: "999px", fontWeight: 900 }}>Voltar ao dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050505, #0f172a 58%, #111827)", color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <header style={{ height: "78px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid rgba(148,163,184,0.16)", background: "rgba(2,6,23,0.74)", backdropFilter: "blur(18px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Link href="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>← Arquivo dos Reinos</Link>
          <span style={{ width: "1px", height: "28px", background: "rgba(148,163,184,0.2)" }} />
          <strong style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Master Forge</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: message.includes("sucesso") ? "#86efac" : "#94a3b8", fontSize: "14px" }}>{message || "Cenario carregado do Supabase"}</span>
          <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "12px 18px", borderRadius: "999px", fontWeight: 900, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Salvando..." : "Salvar alteracoes"}</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr 330px", minHeight: "calc(100vh - 78px)" }}>
        <aside style={{ borderRight: "1px solid rgba(148,163,184,0.16)", padding: "24px", background: "rgba(2,6,23,0.56)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 0 }}>Arvore do mundo</p>
          <button style={{ width: "100%", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "13px", borderRadius: "18px", fontWeight: 900, cursor: "pointer" }}>+ Criar nacao</button>

          <div style={{ marginTop: "22px", display: "grid", gap: "16px" }}>
            {nations.map((nation) => (
              <section key={nation.name} style={{ border: "1px solid rgba(148,163,184,0.18)", borderRadius: "22px", padding: "16px", background: "linear-gradient(180deg, rgba(17,24,39,0.9), rgba(15,23,42,0.7))" }}>
                <strong style={{ fontSize: "16px" }}>{nation.name}</strong>
                <p style={{ color: "#fbbf24", margin: "6px 0 14px", fontSize: "13px" }}>{nation.type}</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {nation.children.map((child) => (
                    <span key={child} style={{ color: "#cbd5e1", fontSize: "14px", padding: "9px 10px", borderRadius: "12px", background: "rgba(255,255,255,0.04)" }}>└ {child}</span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section style={{ padding: "30px", overflow: "auto" }}>
          <div style={{ maxWidth: "900px" }}>
            <p style={{ color: "#f59e0b", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>Mesa do mestre</p>
            <h1 style={{ fontSize: "46px", margin: "8px 0 10px", letterSpacing: "-0.05em" }}>{scenario.name}</h1>
            <p style={{ color: "#94a3b8", lineHeight: 1.65, marginBottom: "24px" }}>Edite a visao geral do mundo e expanda suas estruturas narrativas pela arvore lateral.</p>

            <div style={{ display: "grid", gap: "20px", border: "1px solid rgba(148,163,184,0.18)", borderRadius: "28px", padding: "24px", background: "linear-gradient(180deg, rgba(17,24,39,0.94), rgba(15,23,42,0.82))", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
              <label>
                <span style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>Nome do cenario</span>
                <input value={name} onChange={(event) => setName(event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none" }} />
              </label>

              <label>
                <span style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>Descricao basica</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: "170px", padding: "15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none", resize: "vertical" }} />
              </label>
            </div>

            <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {quickActions.map((action) => (
                <button key={action} style={{ border: "1px solid rgba(148,163,184,0.18)", borderRadius: "18px", padding: "16px", background: "rgba(15,23,42,0.78)", color: "#f8fafc", cursor: "pointer", fontWeight: 800 }}>{action}</button>
              ))}
            </div>
          </div>
        </section>

        <aside style={{ borderLeft: "1px solid rgba(148,163,184,0.16)", padding: "24px", background: "rgba(2,6,23,0.54)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 0 }}>Propriedades</p>
          <div style={{ display: "grid", gap: "14px" }}>
            {[
              ["Tipo", "Cenario pessoal"],
              ["Origem", "Supabase"],
              ["ID", scenario.id.slice(0, 8) + "..."],
              ["Estado", "Em construcao"]
            ].map(([label, value]) => (
              <div key={label} style={{ border: "1px solid rgba(148,163,184,0.16)", borderRadius: "18px", padding: "14px", background: "rgba(15,23,42,0.72)" }}>
                <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>{label}</p>
                <strong style={{ display: "block", marginTop: "5px" }}>{value}</strong>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "22px", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "22px", padding: "18px", background: "rgba(245,158,11,0.08)" }}>
            <strong style={{ color: "#fbbf24" }}>Proxima fase</strong>
            <p style={{ color: "#94a3b8", lineHeight: 1.55, fontSize: "14px" }}>Criar nacoes reais dentro deste cenario e listar tudo na arvore do mundo.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
