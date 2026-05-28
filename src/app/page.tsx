import Link from "next/link";

const features = [
  "Crie cenarios de RPG",
  "Organize nacoes, cidades e faccoes",
  "Prepare aventuras em um painel unico"
];

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px", background: "#09090b", color: "#f8fafc" }}>
      <section style={{ maxWidth: "960px", margin: "0 auto" }}>
        <p style={{ color: "#f59e0b", fontWeight: 700 }}>Master Forge</p>
        <h1 style={{ fontSize: "56px", lineHeight: 1, margin: "16px 0" }}>
          Forje mundos inteiros para suas campanhas de RPG.
        </h1>
        <p style={{ color: "#d4d4d8", fontSize: "20px", maxWidth: "680px" }}>
          Organize cenarios, nacoes, cidades, vilas, faccoes e segredos de mestre em um dashboard feito para worldbuilding.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          <Link href="/dashboard" style={{ background: "#f59e0b", color: "#111827", padding: "14px 20px", borderRadius: "999px", fontWeight: 700 }}>
            Abrir dashboard
          </Link>
          <Link href="/login" style={{ border: "1px solid #3f3f46", padding: "14px 20px", borderRadius: "999px", fontWeight: 700 }}>
            Entrar
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "48px" }}>
          {features.map((feature) => (
            <div key={feature} style={{ border: "1px solid #27272a", borderRadius: "24px", padding: "24px", background: "#111827" }}>
              {feature}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
