import { ScenarioAtlasClient } from "./atlas/scenario-atlas-client";

type ScenarioPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = await params;

  return <ScenarioAtlasClient scenarioId={id} />;
}
