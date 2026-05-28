import type { ReactNode } from "react";
import { fieldLabels } from "./section-config";
import type { EditorMode, EntityRows, EntitySection, FieldConfig, SectionConfig } from "./types";

type EntityEditorPanelProps = {
  editorMode: EditorMode;
  editingSection: EntitySection | null;
  config: SectionConfig | null;
  rows: EntityRows;
  formData: Record<string, string>;
  scenarioName: string;
  scenarioDescription: string;
  saving: boolean;
  onScenarioNameChange: (value: string) => void;
  onScenarioDescriptionChange: (value: string) => void;
  onFieldChange: (field: string, value: string) => void;
  onSaveScenario: () => void;
  onSaveEntity: () => void;
  onClose: () => void;
};

function FormLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: 8, fontSize: 14 }}>{label}</span>
      {children}
    </label>
  );
}

function renderField(field: FieldConfig, value: string, onChange: (value: string) => void) {
  if (field.type === "textarea") {
    return <textarea className="forge-textarea" placeholder={field.placeholder} value={value} onChange={(event) => onChange(event.target.value)} />;
  }

  if (field.type === "select") {
    return (
      <select className="forge-input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Selecione</option>
        {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }

  return <input className="forge-input" type={field.inputType ?? "text"} placeholder={field.placeholder} value={value} onChange={(event) => onChange(event.target.value)} />;
}

export function EntityEditorPanel({
  editorMode,
  editingSection,
  config,
  rows,
  formData,
  scenarioName,
  scenarioDescription,
  saving,
  onScenarioNameChange,
  onScenarioDescriptionChange,
  onFieldChange,
  onSaveScenario,
  onSaveEntity,
  onClose
}: EntityEditorPanelProps) {
  return (
    <aside style={{ borderLeft: "1px solid var(--forge-border)", padding: 24, background: "rgba(2,6,23,0.42)", overflow: "auto" }}>
      {!editorMode ? (
        <section className="forge-card-accent" style={{ padding: 20 }}>
          <p className="forge-kicker">Painel de edição</p>
          <h2 style={{ margin: "8px 0" }}>Selecione uma ação</h2>
          <p className="forge-muted" style={{ lineHeight: 1.6 }}>Todos os módulos principais do cenário agora podem ser criados, editados e apagados por aqui.</p>
        </section>
      ) : null}

      {editorMode === "scenario" ? (
        <section className="forge-panel" style={{ padding: 22 }}>
          <p className="forge-kicker">Cenário</p>
          <h2>Editar cenário</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <FormLabel label="Nome"><input className="forge-input" value={scenarioName} onChange={(event) => onScenarioNameChange(event.target.value)} /></FormLabel>
            <FormLabel label="Crônica"><textarea className="forge-textarea" value={scenarioDescription} onChange={(event) => onScenarioDescriptionChange(event.target.value)} /></FormLabel>
            <button className="forge-button-primary" onClick={onSaveScenario} disabled={saving}>{saving ? "Gravando..." : "Gravar"}</button>
            <button className="forge-button-ghost" onClick={onClose}>Cancelar</button>
          </div>
        </section>
      ) : null}

      {(editorMode === "entity-create" || editorMode === "entity-edit") && editingSection && config ? (
        <section className="forge-panel" style={{ padding: 22 }}>
          <p className="forge-kicker">{config.label}</p>
          <h2>{editorMode === "entity-create" ? config.createLabel : `Editar ${config.label.slice(0, -1).toLowerCase()}`}</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {(config.relations ?? []).map((relation) => (
              <FormLabel key={relation} label={fieldLabels[relation]}>
                <select className="forge-input" value={formData[relation] ?? ""} onChange={(event) => onFieldChange(relation, event.target.value)}>
                  <option value="">Nenhum</option>
                  {relation === "nation_id" ? rows.nations.map((item) => <option key={item.id} value={item.id}>{String(item.name ?? "Nação sem nome")}</option>) : null}
                  {relation === "location_id" ? rows.locations.map((item) => <option key={item.id} value={item.id}>{String(item.name ?? "Local sem nome")}</option>) : null}
                </select>
              </FormLabel>
            ))}

            {config.fields.map((field) => (
              <FormLabel key={field.key} label={`${field.label}${field.required ? " *" : ""}`}>
                {renderField(field, formData[field.key] ?? "", (value) => onFieldChange(field.key, value))}
              </FormLabel>
            ))}

            <button className="forge-button-primary" onClick={onSaveEntity} disabled={saving}>{saving ? "Gravando..." : "Gravar"}</button>
            <button className="forge-button-ghost" onClick={onClose}>Cancelar</button>
          </div>
        </section>
      ) : null}
    </aside>
  );
}
