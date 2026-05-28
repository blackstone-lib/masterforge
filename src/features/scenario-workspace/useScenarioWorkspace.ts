"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildInitialData,
  buildPayloadFromForm,
  singularLabelOf,
  titleOf,
  valueText,
} from "./entity-utils";
import { fieldLabels, sectionConfigs } from "./section-config";
import {
  createEntity,
  deleteEntityRecord,
  emptyRows,
  getCurrentUser,
  getScenarioEntities,
  getScenarioForUser,
  updateEntity,
  updateScenario,
} from "./scenario-service";
import type {
  ActiveSection,
  EditorMode,
  EntityRecord,
  EntityRows,
  EntitySection,
  Scenario,
} from "./types";

function matchesSearch(item: EntityRecord, search: string) {
  if (!search.trim()) return true;

  const normalized = search.trim().toLowerCase();

  return Object.values(item).some((value) =>
    valueText(value).toLowerCase().includes(normalized)
  );
}

export function useScenarioWorkspace(scenarioId: string) {
  const router = useRouter();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [rows, setRows] = useState<EntityRows>(emptyRows());
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("overview");
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingSection, setEditingSection] =
    useState<EntitySection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadScenario() {
      const user = await getCurrentUser();

      if (!mounted) return;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: scenarioData, error: scenarioError } =
        await getScenarioForUser(scenarioId, user.id);

      if (!mounted) return;

      if (scenarioError || !scenarioData) {
        setMessage("Cenário não encontrado ou sem permissão de acesso.");
        setLoading(false);
        return;
      }

      const { rows: loadedRows, error } = await getScenarioEntities(
        scenarioData.id
      );

      if (!mounted) return;

      setScenario(scenarioData);
      setScenarioName(scenarioData.name);
      setScenarioDescription(scenarioData.description ?? "");
      setRows(loadedRows);

      if (error) {
        setMessage(error);
      }

      setLoading(false);
    }

    loadScenario();

    return () => {
      mounted = false;
    };
  }, [router, scenarioId]);

  function closeEditor() {
    setEditorMode(null);
    setEditingSection(null);
    setEditingId(null);
    setFormData({});
  }

  function changeSection(section: ActiveSection) {
    if (activeSection !== section) {
      closeEditor();
    }

    setActiveSection(section);
  }

  function updateField(field: string, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
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

    const { data, error } = await updateScenario(
      scenario,
      scenarioName,
      scenarioDescription
    );

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

    const { data, error } =
      editorMode === "entity-create"
        ? await createEntity(config, scenario.id, payload)
        : await updateEntity(config, scenario.id, String(editingId), payload);

    setSaving(false);

    if (error || !data) {
      setMessage(error?.message ?? "Não foi possível gravar o registro.");
      return;
    }

    setRows((current) => ({
      ...current,
      [editingSection]:
        editorMode === "entity-create"
          ? [data, ...current[editingSection]]
          : current[editingSection].map((item) =>
              item.id === data.id ? data : item
            ),
    }));

    closeEditor();
    setMessage(`${singularLabelOf(editingSection)} gravado na Forja.`);
  }

  async function deleteEntity(section: EntitySection, item: EntityRecord) {
    if (!scenario) return;

    const config = sectionConfigs[section];
    const label = String(titleOf(item, config));

    if (!window.confirm(`Apagar "${label}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

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
      [section]: current[section].filter((row) => row.id !== item.id),
    }));

    if (editingId === item.id) {
      closeEditor();
    }

    setMessage(`${singularLabelOf(section)} apagado da Forja.`);
  }

  const editingConfig = editingSection ? sectionConfigs[editingSection] : null;

  const searchResults = (Object.keys(sectionConfigs) as EntitySection[]).flatMap(
    (section) =>
      rows[section]
        .filter((item) => matchesSearch(item, search))
        .map((item) => ({ section, item }))
  );

  return {
    scenario,
    rows,
    activeSection,
    editorMode,
    editingSection,
    editingConfig,
    formData,
    scenarioName,
    scenarioDescription,
    search,
    searchResults,
    loading,
    saving,
    message,
    setScenarioName,
    setScenarioDescription,
    setSearch,
    changeSection,
    updateField,
    openCreate,
    openEdit,
    openScenarioEditor,
    saveScenario,
    saveEntity,
    deleteEntity,
    closeEditor,
  };
}