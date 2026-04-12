"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Credenciales incorrectas. Verificá email y contraseña.");
    } else {
      router.push("/admin");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h1
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.5rem",
            fontFamily: "var(--font-barlow-condensed)",
          }}
        >
          Panel{" "}
          <span style={{ color: "var(--accent)" }}>Admin</span>
        </h1>
        <p style={{ margin: "0 0 2rem", color: "var(--text2)", fontSize: "0.9rem" }}>
          Acceso restringido — MotorStock
        </p>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="admin@motorstock.cl"
              autoComplete="email"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p
              style={{
                margin: 0,
                color: "#ef4444",
                fontSize: "0.85rem",
                padding: "0.5rem 0.75rem",
                background: "#ef444411",
                borderRadius: 6,
              }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem",
              background: loading ? "var(--border)" : "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: "var(--font-barlow)",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--text2)",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const inputStyle: React.CSSProperties = {
  padding: "0.65rem 0.85rem",
  background: "var(--bg3)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "var(--font-barlow)",
};
