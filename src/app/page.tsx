import Link from "next/link";

const features = [
  { title: "Cenários vivos", text: "Crie mundos, continentes, reinos e regiões com contexto para a mesa." },
  { title: "Árvore de mundo", text: "Organize nações, cidades, vilas, facções, personagens e segredos." },
  { title: "Mesa do Mestre", text: "Tenha tudo pronto para consultar antes e durante a sessão." }
];

const previewItems = ["Reino de Aurel", "Ordem do Estandarte", "Capital Áurica", "Culto da Maré Negra"];

export default function HomePage() {
  return (
    <main className="forge-page" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <nav style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", color: "inherit", textDecoration: "none" }}>
          <span className="forge-mark">MF</span>
          <strong style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/login" className="forge-link-pill">Entrar</Link>
          <Link href="/dashboard" className="forge-link-primary">Abrir a Forja</Link>
        </div>
      </nav>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "64px 24px 36px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "42px", alignItems: "center" }}>
        <div>
          <p className="forge-kicker">A forja de mundos para RPG</p>
          <h1 style={{ fontSize: "clamp(48px, 7vw, 86px)", lineHeight: 0.92, margin: "18px 0", letterSpacing: "-0.06em" }}>Forje reinos, guerras e lendas.</h1>
          <p className="forge-muted-strong" style={{ fontSize: "20px", lineHeight: 1.7, maxWidth: "680px" }}>
            Master Forge é uma mesa digital de worldbuilding para mestres criarem cenários, nações, cidades, facções e segredos de campanha em uma estrutura clara, editável e com alma de RPG.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "34px" }}>
            <Link href="/dashboard" className="forge-link-primary" style={{ padding: "15px 22px" }}>Forjar Novo Mundo</Link>
            <Link href="/login" className="forge-link-pill" style={{ padding: "15px 22px" }}>Entrar na conta</Link>
          </div>
        </div>

        <div className="forge-panel" style={{ padding: "22px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(197,124,38,0.18), transparent 18rem)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--forge-border)", paddingBottom: "18px" }}>
            <div>
              <p className="forge-muted" style={{ margin: 0, fontSize: "13px" }}>Cenário ativo</p>
              <h2 style={{ margin: "6px 0 0", fontSize: "26px" }}>Lago das Lamentações</h2>
            </div>
            <span className="forge-status-pill">Em construção</span>
          </div>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "180px 1fr", gap: "18px", marginTop: "20px" }}>
            <aside style={{ display: "grid", gap: "10px" }}>
              {["Visão geral", "Nações", "Cidades", "Facções", "Segredos"].map((item, index) => (
                <span key={item} className={index === 1 ? "forge-nav-item-active" : "forge-nav-item"}>{item}</span>
              ))}
            </aside>
            <section style={{ display: "grid", gap: "12px" }}>
              {previewItems.map((item) => (
                <div key={item} className="forge-card" style={{ padding: "16px" }}>
                  <strong>{item}</strong>
                  <p className="forge-muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>Registro pronto para editar e expandir.</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "18px 24px 70px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
        {features.map((feature) => (
          <article key={feature.title} className="forge-card" style={{ padding: "24px", boxShadow: "0 20px 70px rgba(0,0,0,0.25)" }}>
            <h3 style={{ marginTop: 0 }}>{feature.title}</h3>
            <p className="forge-muted" style={{ lineHeight: 1.6 }}>{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
