import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LogIn, AlertCircle, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await login(email, password);
      navigate("/tasks");
    } catch (err) {
      const msg = err.response?.data?.message || "Login gagal. Periksa kembali email dan password Anda.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage("");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <BookOpen size={28} />
          </div>
          <h2>Masuk ke Akun</h2>
          <p>Kelola dan pantau tugas kelas Anda dengan mudah</p>
        </div>

        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="nama@sekolah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi (Password)</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner-icon" /> Sedang Masuk...
              </>
            ) : (
              <>
                <LogIn size={18} /> Masuk
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div className="demo-accounts-box">
          <div className="demo-title">
            <Sparkles size={14} /> Akun Demo Cepat:
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo"
              onClick={() => fillQuickAccount("budi.guru@example.com", "password123")}
            >
              Guru: Budi Santoso
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => fillQuickAccount("andi.siswa@example.com", "password123")}
            >
              Siswa: Andi Pratama
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
}

