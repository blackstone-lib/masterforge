import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px", background: "#09090b", color: "#f8fafc" }}>
      <section style={{ width: "100%", maxWidth: "420px", border: "1px solid #27272a", borderRadius: "24px", padding: "28px", background: "#111827" }}>
        <p style={{ color: "#f59e0b", fontWeight: 700 }}>Master Forge</p>
        <h1 style={{ marginTop: 0 }}>Entrar na sua forja</h1>
        <form style={{ display: "grid", gap: "16px" }}>
          <label>
            <span style={{ display: "block", color: "#a1a1aa", marginBottom: "8px" }}>E-mail</span>
            <input type="email" placeholder="voce@email.com" style={{ width: "100%", padding: "12px", borderRadius: "14px", border: "1px solid #3f3f46", background: "#09090b", color: "#f8fafc" }} />
          </label>
          <label>
            <span style={{ display: "block", color: "#a1a1aa", marginBottom: "8px" }}>Senha</span>
            <input type="password" placeholder="********" style={{ width: "100%", padding: "12px", borderRadius: "14px", border: "1px solid #3f3f46", background: "#09090b", color: "#f8fafc" }} />
          </label>
          <button type="button" style={{ background: "#f59e0b", color: "#111827", border: 0, padding: "14px", borderRadius: "999px", fontWeight: 700 }}>
            Entrar
          </button>
        </form>
        <p style={{ color: "#a1a1aa" }}>
          Ainda nao tem conta? <Link href="/dashboard" style={{ color: "#f59e0b" }}>Entrar no modo demo</Link>
        </p>
      </section>
    </main>
  );
}
