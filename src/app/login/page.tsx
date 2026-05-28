import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="forge-page" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 460px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <section style={{ padding: "56px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "inherit", textDecoration: "none", display: "flex", gap: "12px", alignItems: "center" }}>
          <span className="forge-mark">MF</span>
          <strong style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Master Forge</strong>
        </Link>

        <div style={{ maxWidth: "680px" }}>
          <p className="forge-kicker">Mesa do Mestre</p>
          <h1 style={{ fontSize: "64px", lineHeight: 0.96, letterSpacing: "-0.06em", margin: "16px 0" }}>Entre na forja e continue seu mundo.</h1>
          <p className="forge-muted-strong" style={{ fontSize: "19px", lineHeight: 1.7 }}>Acesse seus cenários, revise nações, prepare facções e mantenha os segredos da campanha sempre à mão.</p>
        </div>

        <p style={{ color: "#64748b" }}>© Master Forge</p>
      </section>

      <aside className="forge-panel" style={{ margin: "28px", padding: "34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div>
          <p className="forge-kicker">Acesso</p>
          <h2 style={{ fontSize: "34px", margin: "10px 0" }}>Entrar na conta</h2>
          <p className="forge-muted" style={{ lineHeight: 1.6, marginBottom: "28px" }}>Entre ou crie sua conta usando Supabase Auth.</p>
        </div>

        <LoginForm />

        <div className="forge-card-accent" style={{ marginTop: "22px", padding: "16px" }}>
          <p className="forge-muted-strong" style={{ margin: 0 }}>Quer apenas visualizar?</p>
          <Link href="/dashboard" style={{ color: "var(--forge-gold-light)", fontWeight: 800, textDecoration: "none" }}>Abrir a Forja</Link>
        </div>
      </aside>
    </main>
  );
}
