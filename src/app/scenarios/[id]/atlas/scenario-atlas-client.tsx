"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Item = Record<string, any>;
type SectionKey = "overview" | "nations" | "settlements" | "locations" | "factions" | "characters" | "timeline_events" | "lore_entries";

const sections: Array<{ key: SectionKey; label: string; table?: string }> = [
  { key: "overview", label: "Visão geral" },
  { key: "nations", label: "Nações", table: "nations" },
  { key: "settlements", label: "Assentamentos", table: "settlements" },
  { key: "locations", label: "Locais", table: "locations" },
  { key: "factions", label: "Facções", table: "factions" },
  { key: "characters", label: "Personagens", table: "characters" },
  { key: "timeline_events", label: "Linha do tempo", table: "timeline_events" },
  { key: "lore_entries", label: "Lore", table: "lore_entries" }
];

const fieldsBySection: Record<SectionKey, string[]> = {
  overview: [],
  nations: ["name", "description", "government_type", "capital", "culture", "religion", "current_conflicts", "master_secret"],
  settlements: ["name", "type", "description", "population", "government", "economy", "notable_places"],
  locations: ["name", "type", "description", "importance", "current_situation", "dangers", "rumors", "master_secret"],
  factions: ["name", "type", "description", "leader", "goal", "goals", "influence_level", "current_status", "master_secret"],
  characters: ["name", "title", "type", "race", "class_role", "description", "personality", "background", "goals", "secrets"],
  timeline_events: ["title", "event_type", "date_label", "era", "year", "description", "causes", "consequences", "outcome", "secrets"],
  lore_entries: ["title", "category", "summary", "content", "origin", "importance", "related_entities", "rumors", "adventure_hooks", "master_notes"]
};

const labels: Record<string, string> = {
  name: "Nome",
  title: "Título",
  type: "Tipo",
  description: "Descrição",
  government_type: "Governo",
  capital: "Capital",
  culture: "Cultura",
  religion: "Religião",
  current_conflicts: "Conflitos atuais",
  master_secret: "Segredo do mestre",
  population: "População",
  government: "Governo",
  economy: "Economia",
  notable_places: "Pontos notáveis",
  importance: "Importância",
  current_situation: "Situação atual",
  dangers: "Perigos",
  rumors: "Rumores",
  leader: "Líder",
  goal: "Objetivo",
  goals: "Objetivos",
  influence_level: "Influência",
  current_status: "Status atual",
  race: "Raça",
  class_role: "Função",
  personality: "Personalidade",
  background: "Histórico",
  secrets: "Segredos",
  event_type: "Tipo de evento",
  date_label: "Data",
  era: "Era",
  year: "Ano",
  causes: "Causas",
  consequences: "Consequências",
  outcome: "Resultado",
  category: "Categoria",
  summary: "Resumo",
  content: "Conteúdo",
  origin: "Origem",
  related_entities: "Entidades relacionadas",
  adventure_hooks: "Ganchos de aventura",
  master_notes: "Notas do mestre"
};

function valueOf(value: unknown) {
  if (value === null || value === undefined || value === "") return "Não definido";
  return String(value);
}

function titleOf(item: Item, active: SectionKey) {
  if (active === "timeline_events") return item.title;
  if (active === "lore_entries") return item.title;
  return item.name || item.title || "Registro sem nome";
}

export function ScenarioAtlasClient({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Item | null>(null);
  const [active, setActive] = useState<SectionKey>("overview");
  const [data, setData] = useState<Record<SectionKey, Item[]>>({
    overview: [],
    nations: [],
    settlements: [],
    locations: [],
    factions: [],
    characters: [],
    timeline_events: [],
    lore_entries: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAtlas() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: scenarioData, error: scenarioError } = await supabase
        .from("scenarios")
        .select("*")
        .eq("id", scenarioId)
        .eq("user_id", userData.user.id)
        .single();

      if (scenarioError || !scenarioData) {
        setMessage("Cenário não encontrado ou sem permissão.");
        setLoading(false);
        return;
      }

      const nextData: Record<SectionKey, Item[]> = {
        overview: [],
        nations: [],
        settlements: [],
        locations: [],
        factions: [],
        characters: [],
        timeline_events: [],
        lore_entries: []
      };

      for (const section of sections) {
        if (!section.table) continue;
        const { data: rows, error } = await supabase
          .from(section.table)
          .select("*")
          .eq("scenario_id", scenarioId)
          .order("created_at", { ascending: false });

        if (error) setMessage(error.message);
        nextData[section.key] = rows ?? [];
      }

      setScenario(scenarioData);
      setData(nextData);
      setMessage("Atlas carregado da Forja.");
      setLoading(false);
    }

    loadAtlas();
  }, [router, scenarioId]);

  if (loading) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section className="forge-card-accent" style={{ padding: 30 }}>
          <p className="forge-kicker">Master Forge</p>
          <h1>Abrindo o atlas...</h1>
        </section>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section className="forge-card-accent" style={{ padding: 30 }}>
          <h1>Cenário não encontrado</h1>
          <p>{message}</p>
          <Link href="/dashboard" className="forge-link-primary">Voltar</Link>
        </section>
      </main>
    );
  }

  const activeRows = data[active] ?? [];

  return (
    <main className="forge-page" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <header style={{ height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid var(--forge-border)", background: "rgba(2,6,23,0.78)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Link href={`/scenarios/${scenarioId}`} style={{ color: "var(--forge-muted)", textDecoration: "none" }}>← Voltar ao cenário</Link>
          <span style={{ width: 1, height: 28, background: "var(--forge-border)" }} />
          <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Atlas Completo</strong>
        </div>
        <span style={{ color: "var(--forge-success)", fontSize: 14 }}>{message}</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "292px minmax(560px, 1fr)", minHeight: "calc(100vh - 74px)" }}>
        <aside style={{ borderRight: "1px solid var(--forge-border)", padding: 24, background: "rgba(2,6,23,0.58)" }}>
          <p className="forge-kicker">Árvore do mundo</p>
          <div className="forge-card-accent" style={{ padding: 18, marginTop: 14, marginBottom: 18 }}>
            <strong style={{ display: "block", fontSize: 17 }}>{scenario.name}</strong>
            <p className="forge-muted" style={{ lineHeight: 1.5, margin: "8px 0 0", fontSize: 14 }}>Todos os módulos principais conectados ao Supabase.</p>
          </div>

          <nav style={{ display: "grid", gap: 10 }}>
            {sections.map((section) => (
              <button key={section.key} className={active === section.key ? "forge-nav-item-active" : "forge-nav-item"} onClick={() => setActive(section.key)} style={{ display: "flex", justifyContent: "space-between", color: "inherit", cursor: "pointer", textAlign: "left" }}>
                <span>{active === section.key ? "▾" : "▸"} {section.label}</span>
                {section.key !== "overview" ? <small>{data[section.key].length}</small> : null}
              </button>
            ))}
          </nav>
        </aside>

        <section style={{ padding: 34, overflow: "auto" }}>
          <div style={{ maxWidth: 1040 }}>
            {active === "overview" ? (
              <>
                <p className="forge-kicker">Visão geral</p>
                <h1 style={{ fontSize: 52, lineHeight: 0.98, margin: "10px 0", letterSpacing: "-0.05em" }}>{scenario.name}</h1>
                <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: 760 }}>{scenario.description || "Sem descrição inicial."}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 24 }}>
                  {sections.filter((section) => section.key !== "overview").map((section) => (
                    <div key={section.key} className="forge-card" style={{ padding: 18 }}>
                      <p className="forge-muted" style={{ margin: 0 }}>{section.label}</p>
                      <strong style={{ fontSize: 32 }}>{data[section.key].length}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="forge-kicker">{sections.find((section) => section.key === active)?.label}</p>
                <h1 style={{ fontSize: 46, lineHeight: 0.98, margin: "10px 0 24px", letterSpacing: "-0.05em" }}>{sections.find((section) => section.key === active)?.label}</h1>
                {activeRows.length === 0 ? (
                  <section className="forge-card-accent" style={{ padding: 28, borderStyle: "dashed" }}>
                    <h2 style={{ marginTop: 0 }}>Nenhum registro encontrado.</h2>
                    <p className="forge-muted" style={{ marginBottom: 0 }}>Quando houver dados nessa tabela, eles aparecerão aqui automaticamente.</p>
                  </section>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
                    {activeRows.map((item) => (
                      <article key={item.id} className="forge-panel" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                          <div>
                            <p className="forge-kicker">Registro</p>
                            <h2 style={{ margin: 0, fontSize: 28 }}>{titleOf(item, active)}</h2>
                          </div>
                          {(item.type || item.category || item.event_type) ? <span className="forge-status-pill">{item.type || item.category || item.event_type}</span> : null}
                        </div>
                        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                          {fieldsBySection[active].map((field) => (
                            <div key={field} className="forge-card" style={{ padding: 14 }}>
                              <p className="forge-muted" style={{ margin: 0, fontSize: 13 }}>{labels[field] ?? field}</p>
                              <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.6 }}>{valueOf(item[field])}</p>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
