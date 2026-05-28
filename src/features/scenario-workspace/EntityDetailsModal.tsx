import { fieldLabels } from "./section-config";
import { filledFields, relationName, titleOf, valueText } from "./entity-utils";
import type { EntityRecord, EntityRows, EntitySection, SectionConfig } from "./types";

type EntityDetailsModalProps = {
  section: EntitySection;
  config: SectionConfig;
  item: EntityRecord;
  rows: EntityRows;
  saving?: boolean;
  onClose: () => void;
  onEdit?: (section: EntitySection, item: EntityRecord) => void;
  onDelete?: (section: EntitySection, item: EntityRecord) => void;
};

export function EntityDetailsModal({
  section,
  config,
  item,
  rows,
  saving,
  onClose,
  onEdit,
  onDelete
}: EntityDetailsModalProps) {
  const visibleFields = filledFields(item, config);
  const title = titleOf(item, config);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "rgba(0,0,0,0.68)",
        backdropFilter: "blur(8px)"
      }}
    >
      <section
        className="forge-panel"
        onClick={(event) => event.stopPropagation()}
        style={{ width: "min(880px, 100%)", maxHeight: "88vh", overflow: "auto", padding: 28 }}
      >
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p className="forge-kicker">{config.label}</p>
            <h1 style={{ fontSize: 42, lineHeight: 1, margin: "10px 0 0", letterSpacing: "-0.04em" }}>{String(title)}</h1>
            {(item.type || item.category || item.event_type) ? (
              <span className="forge-status-pill" style={{ display: "inline-block", marginTop: 14 }}>
                {String(item.type || item.category || item.event_type)}
              </span>
            ) : null}
          </div>

          <button className="forge-button-ghost" onClick={onClose}>Fechar</button>
        </header>

        {(config.relations ?? []).some((relation) => item[relation]) ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {(config.relations ?? []).map((relation) => item[relation] ? (
              <span key={relation} className="forge-chip">
                {fieldLabels[relation]}: {relationName(rows, relation, item[relation])}
              </span>
            ) : null)}
          </div>
        ) : null}

        {visibleFields.length === 0 ? (
          <section className="forge-card-accent" style={{ padding: 22, borderStyle: "dashed" }}>
            <h2 style={{ marginTop: 0 }}>Sem detalhes preenchidos.</h2>
            <p className="forge-muted" style={{ lineHeight: 1.6, marginBottom: 0 }}>Edite este registro para acrescentar informações narrativas.</p>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            {visibleFields.map((field) => (
              <div key={field.key} className="forge-card" style={{ padding: 16 }}>
                <p className="forge-muted" style={{ margin: 0, fontSize: 13 }}>{field.label}</p>
                <p className="forge-muted-strong" style={{ margin: "8px 0 0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {valueText(item[field.key])}
                </p>
              </div>
            ))}
          </div>
        )}

        <footer style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 24 }}>
          {onEdit ? <button className="forge-button-primary" onClick={() => onEdit(section, item)}>Editar no drawer</button> : null}
          {onDelete ? (
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
          ) : null}
        </footer>
      </section>
    </div>
  );
}
