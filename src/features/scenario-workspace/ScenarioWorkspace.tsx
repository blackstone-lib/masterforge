"use client";

import Link from "next/link";
import { EntityEditorPanel } from "./EntityEditorPanel";
import { EntityList } from "./EntityList";
import { ScenarioOverview } from "./ScenarioOverview";
import { ScenarioSidebar } from "./ScenarioSidebar";
import { sectionConfigs } from "./section-config";
import { useScenarioWorkspace } from "./useScenarioWorkspace";

export function ScenarioWorkspace({ scenarioId }: { scenarioId: string }) {
  const workspace = useScenarioWorkspace(scenarioId);

  if (workspace.loading) {
    return (
      <main
        className="forge-page"
        style={{ display: "grid", placeItems: "center" }}
      >
        <section className="forge-card-accent" style={{ padding: 30 }}>
          <p className="forge-kicker">Master Forge</p>
          <h1>Abrindo cenário...</h1>
        </section>
      </main>
    );
  }

  if (!workspace.scenario) {
    return (
      <main
        className="forge-page"
        style={{ display: "grid", placeItems: "center" }}
      >
        <section className="forge-card-accent" style={{ padding: 30 }}>
          <h1>Cenário não encontrado</h1>
          <p className="forge-muted">{workspace.message}</p>
          <Link href="/dashboard" className="forge-link-primary">
            Voltar
          </Link>
        </section>
      </main>
    );
  }

  const currentSection =
    workspace.activeSection === "overview" ? null : workspace.activeSection;

  return (
    <main
      className="forge-page"
      style={{
        display: "grid",
        gridTemplateColumns: "292px minmax(620px, 1fr) 420px",
        minHeight: "100vh",
      }}
    >
      <ScenarioSidebar
        scenario={workspace.scenario}
        rows={workspace.rows}
        activeSection={workspace.activeSection}
        onChangeSection={workspace.changeSection}
      />

      <section style={{ padding: 34, overflow: "auto" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <input
            className="forge-input"
            value={workspace.search}
            onChange={(event) => workspace.setSearch(event.target.value)}
            placeholder="Buscar neste cenário..."
            style={{ maxWidth: 520 }}
          />

          {workspace.search.trim() ? (
            <button
              className="forge-button-ghost"
              onClick={() => workspace.setSearch("")}
            >
              Limpar
            </button>
          ) : null}
        </div>

        {workspace.search.trim() ? (
          <p
            className="forge-muted"
            style={{ marginTop: -4, marginBottom: 18 }}
          >
            {workspace.searchResults.length} resultado
            {workspace.searchResults.length === 1 ? "" : "s"} encontrado
            {workspace.searchResults.length === 1 ? "" : "s"} no cenário.
          </p>
        ) : null}

        {workspace.message ? (
          <p
            style={{
              color: workspace.message.includes("Forja")
                ? "var(--forge-success)"
                : "var(--forge-danger)",
              lineHeight: 1.5,
            }}
          >
            {workspace.message}
          </p>
        ) : null}

        {workspace.activeSection === "overview" ? (
          <ScenarioOverview
            scenario={workspace.scenario}
            rows={workspace.rows}
            search={workspace.search}
            searchResults={workspace.searchResults}
            onChangeSection={workspace.changeSection}
            onEditScenario={workspace.openScenarioEditor}
            onCreateEntity={workspace.openCreate}
          />
        ) : currentSection ? (
          <EntityList
            section={currentSection}
            config={sectionConfigs[currentSection]}
            rows={workspace.rows}
            saving={workspace.saving}
            search={workspace.search}
            onCreate={workspace.openCreate}
            onEdit={workspace.openEdit}
            onDelete={workspace.deleteEntity}
          />
        ) : null}
      </section>

      <EntityEditorPanel
        editorMode={workspace.editorMode}
        editingSection={workspace.editingSection}
        config={workspace.editingConfig}
        rows={workspace.rows}
        formData={workspace.formData}
        scenarioName={workspace.scenarioName}
        scenarioDescription={workspace.scenarioDescription}
        saving={workspace.saving}
        onScenarioNameChange={workspace.setScenarioName}
        onScenarioDescriptionChange={workspace.setScenarioDescription}
        onFieldChange={workspace.updateField}
        onSaveScenario={workspace.saveScenario}
        onSaveEntity={workspace.saveEntity}
        onClose={workspace.closeEditor}
      />
    </main>
  );
}