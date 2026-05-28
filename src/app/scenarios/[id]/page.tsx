import Link from "next/link";

const nations = [
  {
    name: "Reino de Aurel",
    type: "Monarquia solar",
    children: ["Capital Aurica", "Vila de Brumavale", "Ordem do Estandarte"]
  },
  {
    name: "Confederacao de Varkhan",
    type: "Cidades-estado",
    children: ["Porto Cinzento", "Guilda dos Navegantes"]
  }
];

export default function ScenarioPage({ params }: { params: { id: string } }) {
  return (
    <main style={{ minHeight: "100vh", background: "#09090b", color: "#f8fafc" }}>
      <header style={{ height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid #27272a", background: "#111827" }}>
        <div>
          <Link href="/dashboard" style={{ color: "#a1a1aa" }}>← Dashboard</Link>
          <strong style={{ display: "block", marginTop: "4px" }}>Master Forge</strong>
        </div>
        <button style={{ background: "#f59e0b", color: "#111827", border: 0, padding: "12px 18px", borderRadius: "999px", fontWeight: 700 }}>
          Salvar alteracoes
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "calc(100vh - 72px)" }}>
        <aside style={{ borderRight: "1px solid #27272a", padding: "24px", background: "#0f172a" }}>
          <button style={{ width: "100%", background: "#f59e0b", color: "#111827", border: 0, padding: "12px", borderRadius: "16px", fontWeight: 700 }}>
            + Criar nacao
          </button>

          <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
            {nations.map((nation) => (
              <section key={nation.name} style={{ border: "1px solid #334155", borderRadius: "18px", padding: "16px", background: "#111827" }}>
                <strong>{nation.name}</strong>
                <p style={{ color: "#a1a1aa", margin: "6px 0 12px" }}>{nation.type}</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {nation.children.map((child) => (
                    <span key={child} style={{ color: "#d4d4d8", fontSize: "14px", paddingLeft: "12px" }}>• {child}</span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section style={{ padding: "32px" }}>
          <div style={{ maxWidth: "860px" }}>
            <p style={{ color: "#f59e0b", fontWeight: 700 }}>Editor de cenario</p>
            <h1 style={{ fontSize: "40px", marginTop: 0 }}>Cenario: {params.id}</h1>

            <div style={{ display: "grid", gap: "20px", border: "1px solid #27272a", borderRadius: "24px", padding: "24px", background: "#111827" }}>
              <label>
                <span style={{ display: "block", color: "#a1a1aa", marginBottom: "8px" }}>Nome do cenario</span>
                <input defaultValue="Reino de Aurel" style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #3f3f46", background: "#09090b", color: "#f8fafc" }} />
              </label>

              <label>
                <span style={{ display: "block", color: "#a1a1aa", marginBottom: "8px" }}>Descricao basica</span>
                <textarea defaultValue="Um mundo de antigas dinastias, ruinas sagradas e disputas entre casas nobres." style={{ width: "100%", minHeight: "160px", padding: "14px", borderRadius: "14px", border: "1px solid #3f3f46", background: "#09090b", color: "#f8fafc" }} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                <button style={{ border: "1px solid #3f3f46", borderRadius: "16px", padding: "14px", background: "#0f172a", color: "#f8fafc" }}>+ Cidade</button>
                <button style={{ border: "1px solid #3f3f46", borderRadius: "16px", padding: "14px", background: "#0f172a", color: "#f8fafc" }}>+ Vila</button>
                <button style={{ border: "1px solid #3f3f46", borderRadius: "16px", padding: "14px", background: "#0f172a", color: "#f8fafc" }}>+ Faccao</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
