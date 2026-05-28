"use client";

import { useEffect, useState } from "react";
import {
  getSettlementsByScenario,
  type Settlement
} from "@/services/settlementsService";

const scenarioId = "6c2123d4-0536-4084-8e45-6d41efc72f4b";

export default function TestSupabasePage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettlements() {
      try {
        const data = await getSettlementsByScenario(scenarioId);
        setSettlements(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Erro desconhecido"
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettlements();
  }, []);

  return (
    <main className="forge-page" style={{ minHeight: "100vh", padding: "40px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <section className="forge-panel" style={{ maxWidth: "920px", margin: "0 auto", padding: "28px" }}>
        <p className="forge-kicker">Teste de conexão</p>
        <h1 style={{ marginTop: 0 }}>Supabase conectado ao Master Forge</h1>

        {loading ? <p className="forge-muted">Carregando assentamentos...</p> : null}

        {errorMessage ? (
          <div className="forge-card" style={{ padding: "16px", borderColor: "var(--forge-danger)" }}>
            <strong>Erro ao buscar dados</strong>
            <p className="forge-muted" style={{ marginBottom: 0 }}>{errorMessage}</p>
          </div>
        ) : null}

        {!loading && !errorMessage ? (
          <div style={{ display: "grid", gap: "14px" }}>
            <p className="forge-muted-strong">
              Assentamentos encontrados: {settlements.length}
            </p>

            {settlements.map((settlement) => (
              <article key={settlement.id} className="forge-card" style={{ padding: "18px" }}>
                <h2 style={{ margin: "0 0 8px" }}>{settlement.name}</h2>
                <p className="forge-muted" style={{ margin: "0 0 10px" }}>
                  {settlement.type ?? "Tipo não informado"}
                </p>
                <p style={{ lineHeight: 1.6 }}>{settlement.description}</p>
                <p className="forge-muted" style={{ marginBottom: 0 }}>
                  População: {settlement.population ?? "—"} · Governo: {settlement.government ?? "—"} · Economia: {settlement.economy ?? "—"}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
