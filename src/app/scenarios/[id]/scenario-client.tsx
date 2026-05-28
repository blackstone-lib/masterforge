"use client";

import { ScenarioWorkspace } from "@/features/scenario-workspace/ScenarioWorkspace";

export function ScenarioClient({ scenarioId }: { scenarioId: string }) {
  return <ScenarioWorkspace scenarioId={scenarioId} />;
}
