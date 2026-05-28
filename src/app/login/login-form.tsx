"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

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

    setMessage("Conta criada. Confira seu e-mail se o Supabase pedir confirmação.");
  }

  return (
    <form style={{ display: "grid", gap: "18px" }}>
      <label>
        <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "9px", fontSize: "14px" }}>E-mail</span>
        <input
          type="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="forge-input"
        />
      </label>

      <label>
        <span style={{ display: "block", color: "var(--forge-muted-strong)", marginBottom: "9px", fontSize: "14px" }}>Senha</span>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="forge-input"
        />
      </label>

      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="forge-button-primary"
        style={{ marginTop: "8px", opacity: loading ? 0.72 : 1 }}
      >
        {loading ? "Aguarde..." : "Entrar na Forja"}
      </button>

      <button
        type="button"
        onClick={handleSignUp}
        disabled={loading}
        className="forge-button-ghost"
        style={{ opacity: loading ? 0.72 : 1 }}
      >
        Criar conta
      </button>

      {message ? (
        <p style={{ margin: 0, color: message.toLowerCase().includes("created") || message.toLowerCase().includes("criada") ? "var(--forge-success)" : "var(--forge-danger)", lineHeight: 1.5 }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
