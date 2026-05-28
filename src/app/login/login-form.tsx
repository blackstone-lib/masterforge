"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Conta criada. Confira seu e-mail se o Supabase pedir confirmacao.");
  }

  return (
    <form style={{ display: "grid", gap: "18px" }}>
      <label>
        <span style={{ display: "block", color: "#cbd5e1", marginBottom: "9px", fontSize: "14px" }}>E-mail</span>
        <input
          type="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: "14px 15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none" }}
        />
      </label>

      <label>
        <span style={{ display: "block", color: "#cbd5e1", marginBottom: "9px", fontSize: "14px" }}>Senha</span>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: "14px 15px", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.24)", background: "rgba(2,6,23,0.68)", color: "#f8fafc", outline: "none" }}
        />
      </label>

      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        style={{ marginTop: "8px", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", border: 0, padding: "15px", borderRadius: "999px", fontWeight: 900, cursor: "pointer", opacity: loading ? 0.72 : 1 }}
      >
        {loading ? "Aguarde..." : "Entrar na forja"}
      </button>

      <button
        type="button"
        onClick={handleSignUp}
        disabled={loading}
        style={{ background: "rgba(15,23,42,0.78)", color: "#f8fafc", border: "1px solid rgba(148,163,184,0.24)", padding: "15px", borderRadius: "999px", fontWeight: 800, cursor: "pointer", opacity: loading ? 0.72 : 1 }}
      >
        Criar conta
      </button>

      {message ? (
        <p style={{ margin: 0, color: message.toLowerCase().includes("created") || message.toLowerCase().includes("criada") ? "#86efac" : "#fca5a5", lineHeight: 1.5 }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
