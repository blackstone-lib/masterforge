import { sectionConfigs } from "./section-config";
import type { EntityRows, EntitySection, Scenario } from "./types";

type ScenarioOverviewProps = {
  scenario: Scenario;
  rows: EntityRows;
  onEditScenario: () => void;
  onCreateEntity: (section: EntitySection) => void;
};

export function ScenarioOverview({ scenario, rows, onEditScenario, onCreateEntity }: ScenarioOverviewProps) {
  const stats = (Object.keys(sectionConfigs) as EntitySection[]).map((section) => [sectionConfigs[section].label, rows[section].length] as const);

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
        {stats.map(([label, value]) => (
          <div key={label} className="forge-card" style={{ padding: 18 }}>
            <p className="forge-muted" style={{ margin: 0 }}>{label}</p>
            <strong style={{ display: "block", fontSize: 32, marginTop: 6 }}>{value}</strong>
          </div>
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
