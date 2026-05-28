import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 460px", background: "radial-gradient(circle at 18% 10%, rgba(245,158,11,0.22), transparent 28rem), linear-gradient(135deg, #050505, #0f172a 58%, #111827)", color: "#f8fafc", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <section style={{ padding: "56px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ width: "42px", height: "42px", borderRadius: "14px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #f59e0b, #7f1d1d)", color: "#111827", fontWeight: 900 }}>MF</span>
          <strong style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>

        <div style={{ maxWidth: "680px" }}>
          <p style={{ color: "#f59e0b", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>Mesa do mestre</p>
          <h1 style={{ fontSize: "64px", lineHeight: 0.96, letterSpacing: "-0.06em", margin: "16px 0" }}>Entre na forja e continue seu mundo.</h1>
          <p style={{ color: "#cbd5e1", fontSize: "19px", lineHeight: 1.7 }}>Acesse seus cenarios, revise nacoes, prepare faccoes e mantenha os segredos da campanha sempre a mao.</p>
        </div>

        <p style={{ color: "#64748b" }}>© Master Forge</p>
      </section>

      <aside style={{ margin: "28px", border: "1px solid rgba(245, 158, 11, 0.22)", borderRadius: "34px", background: "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(2,6,23,0.9))", boxShadow: "0 30px 90px rgba(0,0,0,0.45)", padding: "34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div>
          <p style={{ color: "#f59e0b", fontWeight: 800, marginTop: 0 }}>Acesso</p>
          <h2 style={{ fontSize: "34px", margin: "0 0 10px" }}>Entrar na conta</h2>
          <p style={{ color: "#94a3b8", lineHeight: 1.6, marginBottom: "28px" }}>Login visual preparado para receber Supabase Auth.</p>
        </div>

        <form style={{ display: "grid", gap: "18px" }}>
          <label>
            <span style={{ display: "block", color: "#cbd5e1", marginBottom: "9px", fontSize: "14px" }}>E-mail</span>
            <input type="email" placeholder="voce@email.com" style={{ width: "100%", boxSizing: "border-box", padding: "14px 15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none" }} />
          </label>
          <label>
            <span style={{ display: "block", color: "#cbd5e1", marginBottom: "9px", fontSize: "14px" }}>Senha</span>
            <input type="password" placeholder="********" style={{ width: "100%", boxSizing: "border-box", padding: "14px 15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none" }} />
          </label>
          <button type="button" style={{ marginTop: "8px", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "15px", borderRadius: "999px", fontWeight: 900, cursor: "pointer" }}>Entrar na forja</button>
        </form>

        <div style={{ marginTop: "22px", padding: "16px", borderRadius: "18px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.16)" }}>
          <p style={{ color: "#cbd5e1", margin: 0 }}>Ainda sem login real?</p>
          <Link href="/dashboard" style={{ color: "#fbbf24", fontWeight: 800, textDecoration: "none" }}>Entrar no modo demo</Link>
        </div>
      </aside>
    </main>
  );
}
