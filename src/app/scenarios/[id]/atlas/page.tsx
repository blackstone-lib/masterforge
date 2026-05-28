import { ScenarioAtlas } from "@/features/scenario-atlas/ScenarioAtlas";

type ScenarioAtlasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScenarioAtlasPage({ params }: ScenarioAtlasPageProps) {
  const { id } = await params;

  return <ScenarioAtlas scenarioId={id} />;
}
