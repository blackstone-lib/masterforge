"use client";

import { useState } from "react";
import { EntityDetailsModal } from "./EntityDetailsModal";
import { relationName, singularLabelOf, titleOf } from "./entity-utils";
import type { EntityRecord, EntityRows, EntitySection, SectionConfig } from "./types";

type EntityListProps = {
  section: EntitySection;
  config: SectionConfig;
  rows: EntityRows;
  saving: boolean;
  onCreate: (section: EntitySection, extra?: Record<string, string>) => void;
  onEdit: (section: EntitySection, item: EntityRecord) => void;
  onDelete: (section: EntitySection, item: EntityRecord) => void;
};

function EmptyBox({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <section className="forge-card-accent" style={{ borderStyle: "dashed", padding: 30 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p className="forge-muted" style={{ lineHeight: 1.6 }}>{text}</p>
      {actionLabel && onAction ? <button className="forge-button-primary" onClick={onAction}>{actionLabel}</button> : null}
    </section>
  );
}

export function EntityList({ section, config, rows, saving, onCreate, onEdit, onDelete }: EntityListProps) {
  const sectionRows = rows[section];
  const [selectedItem, setSelectedItem] = useState<EntityRecord | null>(null);

  if (sectionRows.length === 0) {
    return <EmptyBox title={config.emptyTitle} text={config.emptyText} actionLabel={config.createLabel} onAction={() => onCreate(section)} />;
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <p className="forge-kicker">Editor</p>
          <h2 style={{ margin: "6px 0 0" }}>{config.label}</h2>
        </div>
        <button className="forge-button-primary" onClick={() => onCreate(section)}>+ {config.createLabel}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        {sectionRows.map((item) => (
          <article
            key={item.id}
            className="forge-card"
            onClick={() => setSelectedItem(item)}
            style={{
              padding: 18,
              cursor: "pointer",
              minHeight: 142,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 18px 56px rgba(0,0,0,0.22)"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <p className="forge-kicker">{singularLabelOf(section)}</p>
                  <h3 style={{ margin: "8px 0 0", fontSize: 24, lineHeight: 1.08 }}>{String(titleOf(item, config))}</h3>
                </div>
                {(item.type || item.category || item.event_type) ? (
                  <span className="forge-status-pill">{String(item.type || item.category || item.event_type)}</span>
                ) : null}
              </div>

              {(config.relations ?? []).some((relation) => item[relation]) ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  {(config.relations ?? []).map((relation) => item[relation] ? (
                    <span key={relation} className="forge-chip">{relationName(rows, relation, item[relation])}</span>
                  ) : null)}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }} onClick={(event) => event.stopPropagation()}>
              <button className="forge-button-ghost" onClick={() => setSelectedItem(item)}>Abrir</button>
              <button className="forge-button-ghost" onClick={() => onEdit(section, item)}>Editar</button>
              <button
                type="button"
                onClick={() => onDelete(section, item)}
                disabled={saving}
                style={{
                  border: "1px solid rgba(248,113,113,0.38)",
                  borderRadius: 999,
                  padding: "12px 18px",
                  background: "rgba(127,29,29,0.24)",
                  color: "var(--forge-danger)",
                  fontWeight: 850,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.68 : 1
                }}
              >
                Apagar
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedItem ? (
        <EntityDetailsModal
          section={section}
          config={config}
          item={selectedItem}
          rows={rows}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </section>
  );
}

export { titleOf };
