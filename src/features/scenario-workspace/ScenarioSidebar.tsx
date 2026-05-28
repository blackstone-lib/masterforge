import Link from "next/link";
import { sections } from "./section-config";
import type { ActiveSection, EntityRows, Scenario } from "./types";

type ScenarioSidebarProps = {
  scenario: Scenario;
  rows: EntityRows;
  activeSection: ActiveSection;
  onChangeSection: (section: ActiveSection) => void;
};

export function ScenarioSidebar({ scenario, rows, activeSection, onChangeSection }: ScenarioSidebarProps) {
  function sectionCount(section: ActiveSection) {
    if (section === "overview") return null;
    return rows[section].length;
  }

  return (
    <aside style={{ borderRight: "1px solid var(--forge-border)", padding: 24, background: "rgba(2,6,23,0.58)" }}>
      <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none", display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}>
        <span className="forge-mark">MF</span>
        <strong style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>Master Forge</strong>
      </Link>

      <div className="forge-card-accent" style={{ padding: 18, marginBottom: 18 }}>
        <p className="forge-kicker">Cenário ativo</p>
        <strong style={{ display: "block", fontSize: 20, marginTop: 8 }}>{scenario.name}</strong>
      </div>

      <nav style={{ display: "grid", gap: 10 }}>
        {sections.map((section) => {
          const count = sectionCount(section.id);
          return (
            <button
              key={section.id}
              className={activeSection === section.id ? "forge-nav-item-active" : "forge-nav-item"}
              onClick={() => onChangeSection(section.id)}
              style={{ display: "flex", justifyContent: "space-between", color: "inherit", cursor: "pointer", textAlign: "left" }}
            >
              <span>{section.label}</span>
              {count !== null ? <small>{count}</small> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
