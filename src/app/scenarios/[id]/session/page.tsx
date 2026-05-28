import { ScenarioAtlasClient } from "../atlas/scenario-atlas-client";

type ScenarioSessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScenarioSessionPage({ params }: ScenarioSessionPageProps) {
  const { id } = await params;

  return <ScenarioAtlasClient scenarioId={id} />;
}
