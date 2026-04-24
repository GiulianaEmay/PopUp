import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bienvenida, Admin");
      navigate("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-soft flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-10">
          <h1 className="font-heading text-4xl text-brand-ink">Pop Up</h1>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-muted mt-2">Panel admin</p>
        </Link>

        <form onSubmit={onSubmit} className="bg-white rounded-3xl p-8 md:p-10 shadow-card space-y-5">
          <h2 className="font-heading text-3xl text-brand-ink">Iniciar sesión</h2>

          <label className="block">
            <span className="block font-body text-xs uppercase tracking-widest text-brand-muted mb-2">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-brand-soft border border-brand-line rounded-full px-5 py-3 font-body text-sm text-brand-ink focus:outline-none focus:border-brand-accent transition-colors"
              data-testid="admin-email-input"
            />
          </label>

          <label className="block">
            <span className="block font-body text-xs uppercase tracking-widest text-brand-muted mb-2">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-brand-soft border border-brand-line rounded-full px-5 py-3 font-body text-sm text-brand-ink focus:outline-none focus:border-brand-accent transition-colors"
              data-testid="admin-password-input"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-ink text-white hover:bg-brand-accent transition-colors rounded-full py-4 text-xs uppercase tracking-[0.2em] font-body disabled:opacity-50"
            data-testid="admin-login-submit"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="font-body text-xs text-brand-muted text-center pt-2">Acceso exclusivo para el equipo Pop Up.</p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
