import { ScenarioClient } from "./scenario-client";

type ScenarioPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = await params;

  return <ScenarioClient scenarioId={id} />;
}