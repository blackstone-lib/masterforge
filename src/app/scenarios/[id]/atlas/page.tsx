import { ScenarioAtlasClient } from "./scenario-atlas-client";

type ScenarioAtlasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScenarioAtlasPage({ params }: ScenarioAtlasPageProps) {
  const { id } = await params;

  return <ScenarioAtlasClient scenarioId={id} />;
}
