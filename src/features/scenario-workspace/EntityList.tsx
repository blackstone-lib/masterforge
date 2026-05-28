import type { ReactNode } from "react";
import type { EntityRecord, EntityRows, EntitySection, RelationKey, SectionConfig } from "./types";

type EntityListProps = {
  section: EntitySection;
  config: SectionConfig;
  rows: EntityRows;
  saving: boolean;
  onCreate: (section: EntitySection, extra?: Record<string, string>) => void;
  onEdit: (section: EntitySection, item: EntityRecord) => void;
  onDelete: (section: EntitySection, item: EntityRecord) => void;
};

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "Não definido";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function titleOf(item: EntityRecord, config: SectionConfig) {
  return item[config.titleField] || item.name || item.title || "Registro sem nome";
}

function relationName(rows: EntityRows, relation: RelationKey, value: unknown) {
  if (!value) return "";

  if (relation === "nation_id") {
    const nation = rows.nations.find((item) => item.id === value);
    return nation ? String(nation.name ?? "Nação vinculada") : "Nação vinculada";
  }

  const location = rows.locations.find((item) => item.id === value);
  return location ? String(location.name ?? "Local vinculado") : "Local vinculado";
}

function FieldCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="forge-card" style={{ padding: 14 }}>
      <p className="forge-muted" style={{ margin: 0, fontSize: 13 }}>{label}</p>
      <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.55 }}>{valueText(value)}</p>
    </div>
  );
}

function EmptyBox({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <section className="forge-card-accent" style={{ borderStyle: "dashed", padding: 30 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="forge-muted" style={{ lineHeight: 1.6 }}>{text}</p>
      {actionLabel && onAction ? <button className="forge-button-primary" onClick={onAction}>{actionLabel}</button> : null}
    </section>
  );
}

function DangerButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "1px solid rgba(248,113,113,0.38)",
        borderRadius: 999,
        padding: "10px 14px",
        background: "rgba(127,29,29,0.24)",
        color: "var(--forge-danger)",
        fontWeight: 850,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.68 : 1
      }}
    >
      {children}
    </button>
  );
}

export function EntityList({ section, config, rows, saving, onCreate, onEdit, onDelete }: EntityListProps) {
  const sectionRows = rows[section];

  if (sectionRows.length === 0) {
    return <EmptyBox title={config.emptyTitle} text={config.emptyText} actionLabel={config.createLabel} onAction={() => onCreate(section)} />;
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{config.label}</h2>
        <button className="forge-button-primary" onClick={() => onCreate(section)}>+ {config.createLabel}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
        {sectionRows.map((item) => {
          const filledFields = config.fields.filter((field) => item[field.key] !== null && item[field.key] !== undefined && item[field.key] !== "");

          return (
            <article key={item.id} className="forge-panel" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
                <div>
                  <p className="forge-kicker">{config.label.slice(0, -1) || "Registro"}</p>
                  <h2 style={{ margin: "6px 0 12px" }}>{titleOf(item, config)}</h2>
                </div>
                {(item.type || item.category || item.event_type) ? (
                  <span className="forge-status-pill">{String(item.type || item.category || item.event_type)}</span>
                ) : null}
              </div>

              {(config.relations ?? []).length > 0 ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {(config.relations ?? []).map((relation) => item[relation] ? (
                    <span key={relation} className="forge-chip">{relationName(rows, relation, item[relation])}</span>
                  ) : null)}
                </div>
              ) : null}

              {filledFields.length === 0 ? (
                <p className="forge-muted">Este registro ainda não possui campos narrativos preenchidos.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {filledFields
                    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
                    .slice(0, 4)
                    .map((field) => <FieldCard key={field.key} label={field.label} value={item[field.key]} />)}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <button className="forge-button-ghost" onClick={() => onEdit(section, item)}>Editar</button>

                {section === "nations" ? (
                  <>
                    <button className="forge-button-ghost" onClick={() => onCreate("locations", { nation_id: item.id })}>Novo local</button>
                    <button className="forge-button-ghost" onClick={() => onCreate("factions", { nation_id: item.id })}>Nova facção</button>
                  </>
                ) : null}

                {section === "locations" ? (
                  <button className="forge-button-ghost" onClick={() => onCreate("factions", { nation_id: String(item.nation_id ?? ""), location_id: item.id })}>Nova facção</button>
                ) : null}

                <DangerButton onClick={() => onDelete(section, item)} disabled={saving}>Apagar</DangerButton>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export { titleOf, valueText };
