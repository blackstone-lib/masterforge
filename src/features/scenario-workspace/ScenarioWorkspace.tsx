"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityEditorPanel } from "./EntityEditorPanel";
import { EntityList } from "./EntityList";
import { ScenarioOverview } from "./ScenarioOverview";
import { ScenarioSidebar } from "./ScenarioSidebar";
import { buildInitialData, buildPayloadFromForm, titleOf } from "./entity-utils";
import { fieldLabels, sectionConfigs } from "./section-config";
import {
  createEntity,
  deleteEntityRecord,
  emptyRows,
  getCurrentUser,
  getScenarioEntities,
  getScenarioForUser,
  updateEntity,
  updateScenario
} from "./scenario-service";
import type { ActiveSection, EditorMode, EntityRecord, EntityRows, EntitySection, Scenario } from "./types";

export function ScenarioWorkspace({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [rows, setRows] = useState<EntityRows>(emptyRows());
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingSection, setEditingSection] = useState<EntitySection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadScenario() {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: scenarioData, error: scenarioError } = await getScenarioForUser(scenarioId, user.id);

      if (scenarioError || !scenarioData) {
        setMessage("Cenário não encontrado ou sem permissão de acesso.");
        setLoading(false);
        return;
      }

      const { rows: loadedRows, error } = await getScenarioEntities(scenarioData.id);

      setScenario(scenarioData);
      setScenarioName(scenarioData.name);
      setScenarioDescription(scenarioData.description ?? "");
      setRows(loadedRows);
      if (error) setMessage(error);
      setLoading(false);
    }

    loadScenario();
  }, [router, scenarioId]);

  function closeEditor() {
    setEditorMode(null);
    setEditingSection(null);
    setEditingId(null);
    setFormData({});
  }

  function changeSection(section: ActiveSection) {
    if (activeSection !== section) closeEditor();
    setActiveSection(section);
  }

  function updateField(field: string, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function openCreate(section: EntitySection, extra?: Record<string, string>) {
    const config = sectionConfigs[section];
    setActiveSection(section);
    setEditingSection(section);
    setEditingId(null);
    setFormData(buildInitialData(config, undefined, extra));
    setEditorMode("entity-create");
  }

  function openEdit(section: EntitySection, item: EntityRecord) {
    const config = sectionConfigs[section];
    setActiveSection(section);
    setEditingSection(section);
    setEditingId(item.id);
    setFormData(buildInitialData(config, item));
    setEditorMode("entity-edit");
  }

  function openScenarioEditor() {
    if (!scenario) return;
    setScenarioName(scenario.name);
    setScenarioDescription(scenario.description ?? "");
    setEditorMode("scenario");
  }

  async function saveScenario() {
    if (!scenario || !scenarioName.trim()) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await updateScenario(scenario, scenarioName, scenarioDescription);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setScenario(data);
    closeEditor();
    setMessage("Cenário gravado na Forja.");
  }

  async function saveEntity() {
    if (!scenario || !editingSection) return;

    const config = sectionConfigs[editingSection];
    const titleField = config.titleField;

    if (!formData[titleField]?.trim()) {
      setMessage(`Preencha o campo ${fieldLabels[titleField]}.`);
      return;
    }

    const payload = buildPayloadFromForm(config, formData);

    setSaving(true);
    setMessage("");

    const { data, error } = editorMode === "entity-create"
      ? await createEntity(config, scenario.id, payload)
      : await updateEntity(config, scenario.id, String(editingId), payload);

    setSaving(false);

    if (error || !data) {
      setMessage(error?.message ?? "Não foi possível gravar o registro.");
      return;
    }

    setRows((current) => ({
      ...current,
      [editingSection]: editorMode === "entity-create"
        ? [data, ...current[editingSection]]
        : current[editingSection].map((item) => item.id === data.id ? data : item)
    }));

    closeEditor();
    setMessage(`${config.label.slice(0, -1) || config.label} gravado na Forja.`);
  }

  async function deleteEntity(section: EntitySection, item: EntityRecord) {
    if (!scenario) return;
    const config = sectionConfigs[section];
    const label = String(titleOf(item, config));

    if (!window.confirm(`Apagar "${label}"? Esta ação não pode ser desfeita.`)) return;

    setSaving(true);
    setMessage("");

    const { error } = await deleteEntityRecord(config, scenario.id, item.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((current) => ({
      ...current,
      [section]: current[section].filter((row) => row.id !== item.id)
    }));

    if (editingId === item.id) closeEditor();
    setMessage(`${config.label.slice(0, -1) || config.label} apagado da Forja.`);
  }

  if (loading) {
    return (
      <main className="forge-page" style={{ display: "grid", placeItems: "center" }}>
        <section className="forge-card-accent" style={{ padding: 30 }}>
          <p className="forge-kicker">Master Forge</p>
          <h1>Abrindo cenário...</h1>
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

  const editingConfig = editingSection ? sectionConfigs[editingSection] : null;

  return (
    <main className="forge-page" style={{ display: "grid", gridTemplateColumns: "292px minmax(620px, 1fr) 420px", minHeight: "100vh" }}>
      <ScenarioSidebar scenario={scenario} rows={rows} activeSection={activeSection} onChangeSection={changeSection} />

      <section style={{ padding: 34, overflow: "auto" }}>
        {message ? <p style={{ color: message.includes("Forja") ? "var(--forge-success)" : "var(--forge-danger)", lineHeight: 1.5 }}>{message}</p> : null}

        {activeSection === "overview" ? (
          <ScenarioOverview scenario={scenario} rows={rows} onEditScenario={openScenarioEditor} onCreateEntity={openCreate} />
        ) : (
          <EntityList
            section={activeSection}
            config={sectionConfigs[activeSection]}
            rows={rows}
            saving={saving}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={deleteEntity}
          />
        )}
      </section>

      <EntityEditorPanel
        editorMode={editorMode}
        editingSection={editingSection}
        config={editingConfig}
        rows={rows}
        formData={formData}
        scenarioName={scenarioName}
        scenarioDescription={scenarioDescription}
        saving={saving}
        onScenarioNameChange={setScenarioName}
        onScenarioDescriptionChange={setScenarioDescription}
        onFieldChange={updateField}
        onSaveScenario={saveScenario}
        onSaveEntity={saveEntity}
        onClose={closeEditor}
      />
    </main>
  );
}
