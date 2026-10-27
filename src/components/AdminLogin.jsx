import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.session) {
        throw new Error("No se pudo iniciar sesión.");
      }

      // El servidor verificará después si la
      // cuenta tiene permisos de administrador.
      const response = await fetch("/api/verify-admin", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${data.session.access_token}`,
  },
});

const result = await response.json();

if (!response.ok || !result.ok || !result.isAdmin) {
  await supabase.auth.signOut();

  if (response.status === 403) {
    throw new Error(
      "Esta cuenta no tiene permisos de administrador."
    );
  }

  throw new Error(
    "No se pudo verificar el acceso administrativo."
  );
}

// Solo continuamos si el servidor autorizó la cuenta.
if (onLogin) {
  onLogin(data.session);
}
    } catch (err) {
      setError(
        err.message || "No pudimos iniciar sesión. Verifica tus datos."
    );
      console.error("Error de inicio de sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span>🎨</span>
          <h1>Caritas RD</h1>
          <p>Panel administrativo</p>
        </div>

        <h2>¡Bienvenida de nuevo! 💕</h2>
        <p className="admin-login__subtitle">
          Inicia sesión para gestionar tus celebraciones.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-email">
            Correo electrónico
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />

          <label htmlFor="admin-password">
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
          />

          {error && (
            <p className="admin-login__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="admin-login__footer">
          Acceso exclusivo para personal autorizado.
        </p>
      </div>
    </div>
  );
}