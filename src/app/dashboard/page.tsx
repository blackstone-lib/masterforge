import Link from "next/link";

const scenarios = [
  {
    id: "aurel",
    name: "Reino de Aurel",
    description: "Um reino dourado dividido entre antigas casas nobres e cultos esquecidos.",
    nations: 4,
    factions: 7
  },
  {
    id: "mournlake",
    name: "Lago das Lamentacoes",
    description: "Terras alagadas, ruinas afogadas e lendas sobre uma dama santa.",
    nations: 2,
    factions: 5
  }
];

export default function DashboardPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "32px", background: "#09090b", color: "#f8fafc" }}>
      <section style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <p style={{ color: "#f59e0b", fontWeight: 700 }}>Master Forge</p>
            <h1 style={{ fontSize: "40px", margin: 0 }}>Seus cenarios</h1>
          </div>
          <button style={{ background: "#f59e0b", color: "#111827", border: 0, padding: "14px 20px", borderRadius: "999px", fontWeight: 700 }}>
            + Criar novo cenario
          </button>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
          {scenarios.map((scenario) => (
            <Link key={scenario.id} href={`/scenarios/${scenario.id}`} style={{ border: "1px solid #27272a", borderRadius: "24px", padding: "24px", background: "#111827" }}>
              <h2 style={{ marginTop: 0 }}>{scenario.name}</h2>
              <p style={{ color: "#d4d4d8" }}>{scenario.description}</p>
              <p style={{ color: "#a1a1aa" }}>{scenario.nations} nacoes · {scenario.factions} faccoes</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
