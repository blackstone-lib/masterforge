"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityDetailsModal } from "@/features/scenario-workspace/EntityDetailsModal";
import { relationName, titleOf, valueText } from "@/features/scenario-workspace/entity-utils";
import { sectionConfigs, sections } from "@/features/scenario-workspace/section-config";
import { emptyRows, getCurrentUser, getScenarioEntities, getScenarioForUser } from "@/features/scenario-workspace/scenario-service";
import type { ActiveSection, EntityRecord, EntityRows, EntitySection, Scenario } from "@/features/scenario-workspace/types";

type SelectedEntity = {
  section: EntitySection;
  item: EntityRecord;
};

function matchesSearch(item: EntityRecord, search: string) {
  if (!search.trim()) return true;
  const normalized = search.trim().toLowerCase();
  return Object.values(item).some((value) => valueText(value).toLowerCase().includes(normalized));
}

export function ScenarioAtlas({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [rows, setRows] = useState<EntityRows>(emptyRows());
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAtlas() {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: scenarioData, error: scenarioError } = await getScenarioForUser(scenarioId, user.id);

      if (scenarioError || !scenarioData) {
        setMessage("Cenário não encontrado ou sem permissão.");
        setLoading(false);
        return;
      }

      const { rows: loadedRows, error } = await getScenarioEntities(scenarioData.id);

      setScenario(scenarioData);
      setRows(loadedRows);
      setMessage(error || "Atlas carregado da Forja.");
      setLoading(false);
    }

    loadAtlas();
  }, [router, scenarioId]);

  const entitySections = sections.filter((section): section is { id: EntitySection; label: string } => section.id !== "overview");
  const activeRows = activeSection === "overview" ? [] : rows[activeSection].filter((item) => matchesSearch(item, search));

  const globalResults = useMemo(() => {
    if (!search.trim()) return [];

    return entitySections.flatMap((section) =>
      rows[section.id]
        .filter((item) => matchesSearch(item, search))
        .map((item) => ({ section: section.id, item }))
    );
  }, [entitySections, rows, search]);

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
          <p className="forge-muted">{message}</p>
          <Link href="/dashboard" className="forge-link-primary">Voltar</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="forge-page" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <header style={{ height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid var(--forge-border)", background: "rgba(2,6,23,0.78)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Link href={`/scenarios/${scenarioId}`} style={{ color: "var(--forge-muted)", textDecoration: "none" }}>← Voltar ao editor</Link>
          <span style={{ width: 1, height: 28, background: "var(--forge-border)" }} />
          <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Atlas do Mundo</strong>
        </div>
        <span style={{ color: message.includes("carregado") ? "var(--forge-success)" : "var(--forge-danger)", fontSize: 14 }}>{message}</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "292px minmax(560px, 1fr)", minHeight: "calc(100vh - 74px)" }}>
        <aside style={{ borderRight: "1px solid var(--forge-border)", padding: 24, background: "rgba(2,6,23,0.58)" }}>
          <p className="forge-kicker">Árvore do mundo</p>
          <div className="forge-card-accent" style={{ padding: 18, marginTop: 14, marginBottom: 18 }}>
            <strong style={{ display: "block", fontSize: 17 }}>{scenario.name}</strong>
            <p className="forge-muted" style={{ lineHeight: 1.5, margin: "8px 0 0", fontSize: 14 }}>Consulta rápida, busca global e detalhes em modal.</p>
          </div>

          <input
            className="forge-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar no atlas..."
            style={{ marginBottom: 18 }}
          />

          <nav style={{ display: "grid", gap: 10 }}>
            {sections.map((section) => {
              const count = section.id === "overview" ? null : rows[section.id].length;
              return (
                <button key={section.id} className={activeSection === section.id ? "forge-nav-item-active" : "forge-nav-item"} onClick={() => setActiveSection(section.id)} style={{ display: "flex", justifyContent: "space-between", color: "inherit", cursor: "pointer", textAlign: "left" }}>
                  <span>{activeSection === section.id ? "▾" : "▸"} {section.label}</span>
                  {count !== null ? <small>{count}</small> : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <section style={{ padding: 34, overflow: "auto" }}>
          <div style={{ maxWidth: 1080 }}>
            {activeSection === "overview" ? (
              <>
                <p className="forge-kicker">Visão geral</p>
                <h1 style={{ fontSize: 52, lineHeight: 0.98, margin: "10px 0", letterSpacing: "-0.05em" }}>{scenario.name}</h1>
                <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: 760 }}>{scenario.description || "Sem descrição inicial."}</p>

                {search.trim() ? (
                  <section style={{ marginTop: 28 }}>
                    <h2>Resultados da busca</h2>
                    {globalResults.length === 0 ? (
                      <section className="forge-card-accent" style={{ padding: 24, borderStyle: "dashed" }}>
                        <p className="forge-muted" style={{ margin: 0 }}>Nenhum registro encontrado para esta busca.</p>
                      </section>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                        {globalResults.map(({ section, item }) => {
                          const config = sectionConfigs[section];
                          return (
                            <button key={`${section}-${item.id}`} className="forge-card" onClick={() => setSelectedEntity({ section, item })} style={{ padding: 18, color: "inherit", cursor: "pointer", textAlign: "left" }}>
                              <p className="forge-kicker">{config.label}</p>
                              <h3 style={{ margin: "8px 0 0", fontSize: 24 }}>{String(titleOf(item, config))}</h3>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 24 }}>
                    {entitySections.map((section) => (
                      <button key={section.id} className="forge-card" onClick={() => setActiveSection(section.id)} style={{ padding: 18, color: "inherit", cursor: "pointer", textAlign: "left" }}>
                        <p className="forge-muted" style={{ margin: 0 }}>{section.label}</p>
                        <strong style={{ fontSize: 32 }}>{rows[section.id].length}</strong>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="forge-kicker">{sectionConfigs[activeSection].label}</p>
                <h1 style={{ fontSize: 46, lineHeight: 0.98, margin: "10px 0 24px", letterSpacing: "-0.05em" }}>{sectionConfigs[activeSection].label}</h1>
                {activeRows.length === 0 ? (
                  <section className="forge-card-accent" style={{ padding: 28, borderStyle: "dashed" }}>
                    <h2 style={{ marginTop: 0 }}>Nenhum registro encontrado.</h2>
                    <p className="forge-muted" style={{ marginBottom: 0 }}>Crie registros no editor para que eles apareçam aqui.</p>
                  </section>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                    {activeRows.map((item) => (
                      <button key={item.id} className="forge-card" onClick={() => setSelectedEntity({ section: activeSection, item })} style={{ padding: 18, color: "inherit", cursor: "pointer", textAlign: "left", minHeight: 128 }}>
                        <p className="forge-kicker">{sectionConfigs[activeSection].label.slice(0, -1) || "Registro"}</p>
                        <h3 style={{ margin: "8px 0 0", fontSize: 24, lineHeight: 1.08 }}>{String(titleOf(item, sectionConfigs[activeSection]))}</h3>
                        {(item.type || item.category || item.event_type) ? <span className="forge-status-pill" style={{ display: "inline-block", marginTop: 14 }}>{String(item.type || item.category || item.event_type)}</span> : null}
                        {(sectionConfigs[activeSection].relations ?? []).some((relation) => item[relation]) ? (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                            {(sectionConfigs[activeSection].relations ?? []).map((relation) => item[relation] ? (
                              <span key={relation} className="forge-chip">{relationName(rows, relation, item[relation])}</span>
                            ) : null)}
                          </div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {selectedEntity ? (
        <EntityDetailsModal
          section={selectedEntity.section}
          config={sectionConfigs[selectedEntity.section]}
          item={selectedEntity.item}
          rows={rows}
          onClose={() => setSelectedEntity(null)}
        />
      ) : null}
    </main>
  );
}
