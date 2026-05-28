import Link from "next/link";

const features = [
  { title: "Cenarios vivos", text: "Crie mundos, continentes, reinos e regioes com contexto para a mesa." },
  { title: "Arvore de mundo", text: "Organize nacoes, cidades, vilas, faccoes, personagens e segredos." },
  { title: "Mesa do mestre", text: "Tenha tudo pronto para consultar antes e durante a sessao." }
];

const previewItems = ["Reino de Aurel", "Ordem do Estandarte", "Capital Aurica", "Culto da Maré Negra"];

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 20% 10%, rgba(245, 158, 11, 0.22), transparent 26rem), radial-gradient(circle at 80% 20%, rgba(127, 29, 29, 0.24), transparent 28rem), linear-gradient(135deg, #050505 0%, #0f172a 54%, #111827 100%)", color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <nav style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", color: "inherit", textDecoration: "none" }}>
          <span style={{ width: "42px", height: "42px", borderRadius: "14px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #f59e0b, #7f1d1d)", color: "#111827", fontWeight: 900, boxShadow: "0 0 34px rgba(245, 158, 11, 0.28)" }}>MF</span>
          <strong style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/login" style={{ color: "#e5e7eb", textDecoration: "none", border: "1px solid rgba(148, 163, 184, 0.25)", padding: "11px 16px", borderRadius: "999px", background: "rgba(15, 23, 42, 0.62)" }}>Entrar</Link>
          <Link href="/dashboard" style={{ color: "#111827", textDecoration: "none", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", padding: "11px 16px", borderRadius: "999px", fontWeight: 800 }}>Abrir demo</Link>
        </div>
      </nav>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "64px 24px 36px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "42px", alignItems: "center" }}>
        <div>
          <p style={{ color: "#f59e0b", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0 }}>A forja de mundos para RPG</p>
          <h1 style={{ fontSize: "clamp(48px, 7vw, 86px)", lineHeight: 0.92, margin: "18px 0", letterSpacing: "-0.06em" }}>Forje reinos, guerras e lendas.</h1>
          <p style={{ color: "#cbd5e1", fontSize: "20px", lineHeight: 1.7, maxWidth: "680px" }}>
            Master Forge e um painel de worldbuilding para mestres criarem cenarios, nacoes, cidades, faccoes e segredos de campanha em uma estrutura clara e editavel.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "34px" }}>
            <Link href="/dashboard" style={{ color: "#111827", textDecoration: "none", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", padding: "15px 22px", borderRadius: "999px", fontWeight: 900, boxShadow: "0 18px 45px rgba(245, 158, 11, 0.22)" }}>Comecar a forjar</Link>
            <Link href="/login" style={{ color: "#f8fafc", textDecoration: "none", border: "1px solid rgba(148, 163, 184, 0.28)", padding: "15px 22px", borderRadius: "999px", fontWeight: 800, background: "rgba(15, 23, 42, 0.7)" }}>Entrar na conta</Link>
          </div>
        </div>

        <div style={{ border: "1px solid rgba(245, 158, 11, 0.22)", borderRadius: "34px", background: "linear-gradient(180deg, rgba(17, 24, 39, 0.94), rgba(15, 23, 42, 0.82))", boxShadow: "0 30px 90px rgba(0,0,0,0.52)", padding: "22px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.16), transparent 18rem)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(148, 163, 184, 0.16)", paddingBottom: "18px" }}>
            <div>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>Cenario ativo</p>
              <h2 style={{ margin: "6px 0 0", fontSize: "26px" }}>Lago das Lamentacoes</h2>
            </div>
            <span style={{ color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "999px", padding: "8px 12px", fontSize: "13px" }}>Em construcao</span>
          </div>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "180px 1fr", gap: "18px", marginTop: "20px" }}>
            <aside style={{ display: "grid", gap: "10px" }}>
              {["Visao geral", "Nacoes", "Cidades", "Faccoes", "Segredos"].map((item, index) => (
                <span key={item} style={{ padding: "12px", borderRadius: "14px", background: index === 1 ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.04)", color: index === 1 ? "#fbbf24" : "#cbd5e1" }}>{item}</span>
              ))}
            </aside>
            <section style={{ display: "grid", gap: "12px" }}>
              {previewItems.map((item) => (
                <div key={item} style={{ border: "1px solid rgba(148,163,184,0.16)", borderRadius: "18px", padding: "16px", background: "rgba(2,6,23,0.52)" }}>
                  <strong>{item}</strong>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: "14px" }}>Registro pronto para editar e expandir.</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "18px 24px 70px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
        {features.map((feature) => (
          <article key={feature.title} style={{ border: "1px solid rgba(148, 163, 184, 0.18)", borderRadius: "26px", padding: "24px", background: "rgba(15,23,42,0.7)", boxShadow: "0 20px 70px rgba(0,0,0,0.25)" }}>
            <h3 style={{ marginTop: 0 }}>{feature.title}</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
