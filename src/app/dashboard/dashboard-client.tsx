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
      setMessage("Digite um nome para o cenário.");
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

    if (data) setScenarios((current) => [data, ...current]);

    setNewScenarioName("");
    setNewScenarioDescription("");
    setShowForm(false);
    setMessage("Registro gravado na Forja.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const stats = [
    ["Mundos", String(scenarios.length)],
    ["Nações", "0"],
    ["Locais", "0"],
    ["Facções", "0"]
  ];

  if (loading) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <div className="forge-card-accent" style={{ padding: "30px", boxShadow: "0 24px 80px rgba(0,0,0,0.32)" }}>
          <p className="forge-kicker">Master Forge</p>
          <h1 style={{ marginBottom: 0 }}>Abrindo o Arquivo dos Reinos...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="forge-page" style={{ display: "grid", gridTemplateColumns: "292px 1fr" }}>
      <aside style={{ borderRight: "1px solid var(--forge-border)", padding: "26px", background: "rgba(2,6,23,0.68)" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", display: "flex", gap: "12px", alignItems: "center", marginBottom: "34px" }}>
          <span className="forge-mark">MF</span>
          <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>

        <nav style={{ display: "grid", gap: "10px" }}>
          {["Arquivo dos Reinos", "Biblioteca", "Geradores", "Modelos", "Configurações"].map((item, index) => (
            <span key={item} className={index === 0 ? "forge-nav-item-active" : "forge-nav-item"}>{item}</span>
          ))}
        </nav>

        <div className="forge-card-accent" style={{ marginTop: "34px", padding: "18px" }}>
          <strong style={{ color: "var(--forge-gold-light)" }}>Mestre conectado</strong>
          <p className="forge-muted" style={{ lineHeight: 1.55, fontSize: "14px", wordBreak: "break-word" }}>{user?.email}</p>
          <button onClick={handleSignOut} style={{ width: "100%", marginTop: "8px", border: "1px solid rgba(248,113,113,0.32)", borderRadius: "999px", padding: "10px 12px", background: "rgba(127,29,29,0.28)", color: "var(--forge-danger)", fontWeight: 850, cursor: "pointer" }}>Sair</button>
        </div>
      </aside>

      <section style={{ padding: "34px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", marginBottom: "28px" }}>
          <div>
            <p className="forge-kicker">Mesa do Mestre</p>
            <h1 style={{ fontSize: "54px", lineHeight: 0.96, margin: "10px 0 10px", letterSpacing: "-0.06em" }}>Arquivo dos Reinos</h1>
            <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: "720px", margin: 0 }}>Aqui ficam os mundos que você está forjando. Cada cenário pertence somente à sua conta e pode evoluir para nações, locais, facções, personagens e segredos.</p>
          </div>
          <button className="forge-button-primary" onClick={() => setShowForm((current) => !current)} style={{ whiteSpace: "nowrap" }}>+ Forjar Novo Mundo</button>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "26px" }}>
          {stats.map(([label, value]) => (
            <div className="forge-card" key={label} style={{ padding: "18px" }}>
              <p className="forge-muted" style={{ margin: 0 }}>{label}</p>
              <strong style={{ display: "block", fontSize: "32px", marginTop: "6px" }}>{value}</strong>
            </div>
          ))}
        </div>

        {showForm ? (
          <section className="forge-panel" style={{ padding: "24px", marginBottom: "22px" }}>
            <p className="forge-kicker">Nova forja</p>
            <h2 style={{ margin: "8px 0 16px" }}>Forjar novo mundo</h2>
            <div style={{ display: "grid", gap: "14px" }}>
              <label>
                <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Nome do cenário</span>
                <input className="forge-input" value={newScenarioName} onChange={(event) => setNewScenarioName(event.target.value)} placeholder="Ex: Mares Insulares" />
              </label>
              <label>
                <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "8px", fontSize: "14px" }}>Crônica inicial</span>
                <textarea className="forge-textarea" value={newScenarioDescription} onChange={(event) => setNewScenarioDescription(event.target.value)} placeholder="Uma frase forte sobre o mundo, seus conflitos e sua atmosfera..." style={{ minHeight: "120px" }} />
              </label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button className="forge-button-primary" onClick={handleCreateScenario} disabled={creating} style={{ opacity: creating ? 0.7 : 1 }}>{creating ? "Forjando..." : "Registrar na Forja"}</button>
                <button className="forge-button-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          </section>
        ) : null}

        {message ? <p style={{ color: message.includes("Forja") ? "var(--forge-success)" : "var(--forge-danger)", marginTop: 0 }}>{message}</p> : null}

        {scenarios.length === 0 ? (
          <section className="forge-card-accent" style={{ borderStyle: "dashed", padding: "38px" }}>
            <p className="forge-kicker">Arquivo vazio</p>
            <h2 style={{ marginTop: 0 }}>A forja ainda está fria.</h2>
            <p className="forge-muted" style={{ lineHeight: 1.6, maxWidth: "620px" }}>Forje seu primeiro cenário para começar a organizar nações, cidades, facções e segredos de campanha.</p>
            <button className="forge-button-primary" onClick={() => setShowForm(true)} style={{ marginTop: "10px" }}>Forjar primeiro mundo</button>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
            {scenarios.map((scenario) => (
              <Link key={scenario.id} href={`/scenarios/${scenario.id}`} className="forge-panel" style={{ color: "inherit", textDecoration: "none", padding: "24px", minHeight: "210px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ color: "var(--forge-gold-light)", fontSize: "13px", fontWeight: 850, letterSpacing: "0.12em", textTransform: "uppercase" }}>Mundo forjado</span>
                    <h2 style={{ margin: "9px 0 10px", fontSize: "30px", letterSpacing: "-0.03em" }}>{scenario.name}</h2>
                  </div>
                  <span style={{ width: "46px", height: "46px", borderRadius: "16px", display: "grid", placeItems: "center", background: "rgba(245,158,11,0.14)", color: "var(--forge-gold-light)" }}>✦</span>
                </div>
                <p style={{ color: "var(--forge-muted-strong)", lineHeight: 1.65 }}>{scenario.description || "Sem crônica inicial ainda. Abra o cenário para definir o conceito central do mundo."}</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
                  <span className="forge-chip">0 nações</span>
                  <span className="forge-chip">0 locais</span>
                  <span className="forge-chip">0 facções</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
