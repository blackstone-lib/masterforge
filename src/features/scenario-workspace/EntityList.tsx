"use client";

import { useState } from "react";
import { EntityDetailsModal } from "./EntityDetailsModal";
import { relationName, titleOf } from "./entity-utils";
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

  function editFromModal(item: EntityRecord) {
    setSelectedItem(null);
    onEdit(section, item);
  }

  async function deleteFromModal(item: EntityRecord) {
    setSelectedItem(null);
    onDelete(section, item);
  }

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
                  <p className="forge-kicker">{config.label.slice(0, -1) || "Registro"}</p>
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

              {section === "nations" ? (
                <>
                  <button className="forge-button-ghost" onClick={() => onCreate("locations", { nation_id: item.id })}>Novo local</button>
                  <button className="forge-button-ghost" onClick={() => onCreate("factions", { nation_id: item.id })}>Nova facção</button>
                </>
              ) : null}

              {section === "locations" ? (
                <button className="forge-button-ghost" onClick={() => onCreate("factions", { nation_id: String(item.nation_id ?? ""), location_id: item.id })}>Nova facção</button>
              ) : null}

              {section === "factions" ? (
                <button className="forge-button-ghost" onClick={() => onCreate("characters", { nation_id: String(item.nation_id ?? ""), location_id: String(item.location_id ?? ""), faction_id: item.id })}>Novo personagem</button>
              ) : null}

              {section === "characters" ? (
                <button className="forge-button-ghost" onClick={() => onCreate("timeline_events", { nation_id: String(item.nation_id ?? ""), location_id: String(item.location_id ?? ""), character_id: item.id, faction_id: String(item.faction_id ?? "") })}>Novo evento</button>
              ) : null}

              {section === "timeline_events" ? (
                <button className="forge-button-ghost" onClick={() => onCreate("lore_entries", { event_id: item.id, character_id: String(item.character_id ?? ""), location_id: String(item.location_id ?? ""), faction_id: String(item.faction_id ?? "") })}>Nova lore</button>
              ) : null}
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
          saving={saving}
          onClose={() => setSelectedItem(null)}
          onEdit={editFromModal}
          onDelete={deleteFromModal}
        />
      ) : null}
    </section>
  );
}

export { titleOf };
