import { redirect } from "next/navigation";

type ScenarioSessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScenarioSessionPage({ params }: ScenarioSessionPageProps) {
  const { id } = await params;

  redirect(`/scenarios/${id}/atlas`);
}
