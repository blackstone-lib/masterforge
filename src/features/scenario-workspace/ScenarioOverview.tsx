import { singularLabelOf, titleOf } from "./entity-utils";
import { sectionConfigs } from "./section-config";
import type { ActiveSection, EntityRecord, EntityRows, EntitySection, Scenario } from "./types";

type SearchResult = {
  section: EntitySection;
  item: EntityRecord;
};

type ScenarioOverviewProps = {
  scenario: Scenario;
  rows: EntityRows;
  search: string;
  searchResults: SearchResult[];
  onChangeSection: (section: ActiveSection) => void;
  onEditScenario: () => void;
  onCreateEntity: (section: EntitySection) => void;
};

export function ScenarioOverview({ scenario, rows, search, searchResults, onChangeSection, onEditScenario, onCreateEntity }: ScenarioOverviewProps) {
  const stats = (Object.keys(sectionConfigs) as EntitySection[]).map((section) => [sectionConfigs[section].label, rows[section].length, section] as const);

  if (search.trim()) {
    return (
      <section>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <p className="forge-kicker">Busca global</p>
            <h1 style={{ fontSize: 46, lineHeight: 0.98, margin: "10px 0", letterSpacing: "-0.05em" }}>Resultados em {scenario.name}</h1>
            <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: 760 }}>Clique em uma seção na lateral para filtrar a busca dentro de um módulo específico.</p>
          </div>
          <button className="forge-button-ghost" onClick={onEditScenario}>Editar cenário</button>
        </header>

        {searchResults.length === 0 ? (
          <section className="forge-card-accent" style={{ padding: 28, borderStyle: "dashed" }}>
            <h2 style={{ marginTop: 0 }}>Nenhum resultado encontrado.</h2>
            <p className="forge-muted" style={{ marginBottom: 0 }}>Tente buscar por nome, descrição, vínculo, líder, cidade, evento ou palavra-chave narrativa.</p>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
            {searchResults.map(({ section, item }) => {
              const config = sectionConfigs[section];
              return (
                <button
                  key={`${section}-${item.id}`}
                  className="forge-card"
                  onClick={() => onChangeSection(section)}
                  style={{ padding: 18, color: "inherit", cursor: "pointer", textAlign: "left", minHeight: 118 }}
                >
                  <p className="forge-kicker">{singularLabelOf(section)}</p>
                  <h3 style={{ margin: "8px 0 0", fontSize: 24, lineHeight: 1.08 }}>{String(titleOf(item, config))}</h3>
                  {(item.type || item.category || item.event_type) ? (
                    <span className="forge-status-pill" style={{ display: "inline-block", marginTop: 14 }}>{String(item.type || item.category || item.event_type)}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 26 }}>
        <div>
          <p className="forge-kicker">Mesa do Mestre</p>
          <h1 style={{ fontSize: 52, lineHeight: 0.96, margin: "10px 0", letterSpacing: "-0.05em" }}>{scenario.name}</h1>
          <p className="forge-muted" style={{ lineHeight: 1.65, maxWidth: 720 }}>{scenario.description || "Sem crônica inicial ainda."}</p>
        </div>
        <button className="forge-button-ghost" onClick={onEditScenario}>Editar cenário</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(([label, value, section]) => (
          <button key={label} className="forge-card" onClick={() => onChangeSection(section)} style={{ padding: 18, color: "inherit", cursor: "pointer", textAlign: "left" }}>
            <p className="forge-muted" style={{ margin: 0 }}>{label}</p>
            <strong style={{ display: "block", fontSize: 32, marginTop: 6 }}>{value}</strong>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {(Object.keys(sectionConfigs) as EntitySection[]).map((section) => (
          <button key={section} className="forge-card-accent" onClick={() => onCreateEntity(section)} style={{ padding: 22, color: "inherit", cursor: "pointer", textAlign: "left" }}>
            <p className="forge-kicker">{sectionConfigs[section].label}</p>
            <h2>{sectionConfigs[section].createLabel}</h2>
            <p className="forge-muted">Adicionar novo registro neste módulo.</p>
          </button>
        ))}
      </div>
    </>
  );
}
