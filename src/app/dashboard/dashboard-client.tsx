"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";

type Scenario = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioDescription, setNewScenarioDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setUser(userData.user);

      const { data: scenariosData, error } = await supabase
        .from("scenarios")
        .select("id, user_id, name, description, created_at, updated_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setScenarios(scenariosData ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleCreateScenario() {
    if (!user) return;

    if (!newScenarioName.trim()) {
      setMessage("Digite um nome para o cenario.");
      return;
    }

    setCreating(true);
    setMessage("");

    const { data, error } = await supabase
      .from("scenarios")
      .insert({
        user_id: user.id,
        name: newScenarioName.trim(),
        description: newScenarioDescription.trim()
      })
      .select("id, user_id, name, description, created_at, updated_at")
      .single();

    setCreating(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      setScenarios((currentScenarios) => [data, ...currentScenarios]);
    }

    setNewScenarioName("");
    setNewScenarioDescription("");
    setShowForm(false);
    setMessage("Cenario criado com sucesso.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const stats = [
    { label: "Cenarios", value: String(scenarios.length) },
    { label: "Nacoes", value: "0" },
    { label: "Faccoes", value: "0" },
    { label: "Locais", value: "0" }
  ];

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #050505, #0f172a 58%, #111827)", color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div style={{ border: "1px solid rgba(245,158,11,0.22)", borderRadius: "26px", padding: "28px", background: "rgba(15,23,42,0.76)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 800, margin: 0 }}>Master Forge</p>
          <h1 style={{ marginBottom: 0 }}>Carregando sua forja...</h1>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "270px 1fr", background: "linear-gradient(135deg, #050505, #0f172a 58%, #111827)", color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <aside style={{ borderRight: "1px solid rgba(148,163,184,0.16)", padding: "26px", background: "rgba(2,6,23,0.72)" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", display: "flex", gap: "12px", alignItems: "center", marginBottom: "34px" }}>
          <span style={{ width: "42px", height: "42px", borderRadius: "14px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #f59e0b, #7f1d1d)", color: "#111827", fontWeight: 900 }}>MF</span>
          <strong style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>

        <nav style={{ display: "grid", gap: "10px" }}>
          {["A Forja", "Cenarios", "Biblioteca", "Geradores", "Configuracoes"].map((item, index) => (
            <span key={item} style={{ padding: "13px 14px", borderRadius: "16px", color: index === 0 ? "#fbbf24" : "#cbd5e1", background: index === 0 ? "rgba(245,158,11,0.14)" : "transparent", border: index === 0 ? "1px solid rgba(245,158,11,0.18)" : "1px solid transparent" }}>{item}</span>
          ))}
        </nav>

        <div style={{ marginTop: "34px", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "22px", padding: "18px", background: "rgba(245,158,11,0.08)" }}>
          <strong style={{ color: "#fbbf24" }}>Conta ativa</strong>
          <p style={{ color: "#94a3b8", lineHeight: 1.55, fontSize: "14px", wordBreak: "break-word" }}>{user?.email}</p>
          <button onClick={handleSignOut} style={{ width: "100%", marginTop: "8px", border: "1px solid rgba(248,113,113,0.32)", borderRadius: "999px", padding: "10px 12px", background: "rgba(127,29,29,0.28)", color: "#fecaca", fontWeight: 800, cursor: "pointer" }}>Sair</button>
        </div>
      </aside>

      <section style={{ padding: "32px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <p style={{ color: "#f59e0b", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>Dashboard</p>
            <h1 style={{ fontSize: "46px", margin: "8px 0 0", letterSpacing: "-0.05em" }}>Arquivo dos Reinos</h1>
          </div>
          <button onClick={() => setShowForm((current) => !current)} style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "14px 20px", borderRadius: "999px", fontWeight: 900, cursor: "pointer", boxShadow: "0 18px 45px rgba(245,158,11,0.2)" }}>+ Novo cenario</button>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "26px" }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ border: "1px solid rgba(148,163,184,0.16)", borderRadius: "22px", padding: "18px", background: "rgba(15,23,42,0.74)" }}>
              <p style={{ color: "#94a3b8", margin: 0 }}>{stat.label}</p>
              <strong style={{ display: "block", fontSize: "32px", marginTop: "6px" }}>{stat.value}</strong>
            </div>
          ))}
        </div>

        {showForm ? (
          <section style={{ border: "1px solid rgba(245,158,11,0.22)", borderRadius: "28px", padding: "24px", background: "rgba(15,23,42,0.78)", marginBottom: "22px" }}>
            <h2 style={{ margin: "0 0 14px" }}>Criar novo cenario</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <label>
                <span style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>Nome do cenario</span>
                <input value={newScenarioName} onChange={(event) => setNewScenarioName(event.target.value)} placeholder="Ex: Reino de Aurel" style={{ width: "100%", boxSizing: "border-box", padding: "14px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none" }} />
              </label>
              <label>
                <span style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px" }}>Descricao basica</span>
                <textarea value={newScenarioDescription} onChange={(event) => setNewScenarioDescription(event.target.value)} placeholder="Uma breve descricao do mundo..." style={{ width: "100%", boxSizing: "border-box", minHeight: "110px", padding: "14px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none", resize: "vertical" }} />
              </label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button onClick={handleCreateScenario} disabled={creating} style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "12px 18px", borderRadius: "999px", fontWeight: 900, cursor: "pointer", opacity: creating ? 0.7 : 1 }}>{creating ? "Criando..." : "Criar cenario"}</button>
                <button onClick={() => setShowForm(false)} style={{ border: "1px solid rgba(148,163,184,0.24)", borderRadius: "999px", padding: "12px 18px", background: "rgba(2,6,23,0.45)", color: "#cbd5e1", fontWeight: 800, cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          </section>
        ) : null}

        {message ? <p style={{ color: message.includes("sucesso") ? "#86efac" : "#fca5a5", marginTop: 0 }}>{message}</p> : null}

        {scenarios.length === 0 ? (
          <section style={{ border: "1px dashed rgba(245,158,11,0.38)", borderRadius: "28px", padding: "34px", background: "rgba(245,158,11,0.06)", color: "#f8fafc" }}>
            <h2 style={{ marginTop: 0 }}>Sua forja ainda esta vazia.</h2>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>Crie seu primeiro cenario para comecar a organizar nacoes, cidades, faccoes e segredos de campanha.</p>
            <button onClick={() => setShowForm(true)} style={{ marginTop: "10px", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "13px 18px", borderRadius: "999px", fontWeight: 900, cursor: "pointer" }}>Criar primeiro cenario</button>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
            {scenarios.map((scenario) => (
              <Link key={scenario.id} href={`/scenarios/${scenario.id}`} style={{ color: "inherit", textDecoration: "none", border: "1px solid rgba(148,163,184,0.18)", borderRadius: "28px", padding: "24px", background: "linear-gradient(180deg, rgba(17,24,39,0.92), rgba(15,23,42,0.78))", boxShadow: "0 24px 70px rgba(0,0,0,0.28)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ color: "#fbbf24", fontSize: "13px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cenario pessoal</span>
                    <h2 style={{ margin: "9px 0 10px", fontSize: "28px" }}>{scenario.name}</h2>
                  </div>
                  <span style={{ width: "46px", height: "46px", borderRadius: "16px", display: "grid", placeItems: "center", background: "rgba(245,158,11,0.14)", color: "#fbbf24" }}>✦</span>
                </div>
                <p style={{ color: "#cbd5e1", lineHeight: 1.65 }}>{scenario.description || "Sem descricao ainda."}</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
                  <span style={{ color: "#94a3b8", border: "1px solid rgba(148,163,184,0.18)", borderRadius: "999px", padding: "8px 11px" }}>0 nacoes</span>
                  <span style={{ color: "#94a3b8", border: "1px solid rgba(148,163,184,0.18)", borderRadius: "999px", padding: "8px 11px" }}>0 faccoes</span>
                  <span style={{ color: "#94a3b8", border: "1px solid rgba(148,163,184,0.18)", borderRadius: "999px", padding: "8px 11px" }}>0 locais</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
