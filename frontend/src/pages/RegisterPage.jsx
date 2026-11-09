import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, UserPlus, AlertCircle, Loader2, ShieldCheck, GraduationCap } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      await register(name, email, password, role);
      navigate("/tasks");
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        const errorsObj = {};
        resp.errors.forEach((e) => {
          errorsObj[e.field] = e.message;
        });
        setFieldErrors(errorsObj);
        setErrorMessage(resp.message || "Validasi pendaftaran gagal");
      } else {
        setErrorMessage(resp?.message || "Pendaftaran gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <BookOpen size={28} />
          </div>
          <h2>Buat Akun Baru</h2>
          <p>Pilih peran Anda untuk mulai mengelola atau melihat tugas</p>
        </div>

        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap *</label>
            <input
              id="name"
              type="text"
              className={`form-input ${fieldErrors.name ? "input-error" : ""}`}
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Alamat Email *</label>
            <input
              id="email"
              type="email"
              className={`form-input ${fieldErrors.email ? "input-error" : ""}`}
              placeholder="nama@sekolah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi (Minimal 6 karakter) *</label>
            <input
              id="password"
              type="password"
              className={`form-input ${fieldErrors.password ? "input-error" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label>Pilih Peran Akun *</label>
            <div className="role-selector">
              <label
                className={`role-option ${role === "siswa" ? "role-selected" : ""}`}
                onClick={() => setRole("siswa")}
              >
                <input
                  type="radio"
                  name="role"
                  value="siswa"
                  checked={role === "siswa"}
                  onChange={() => setRole("siswa")}
                />
                <GraduationCap size={20} />
                <div className="role-text">
                  <strong>Siswa</strong>
                  <span>Melihat tugas & tandai selesai</span>
                </div>
              </label>

              <label
                className={`role-option ${role === "guru" ? "role-selected" : ""}`}
                onClick={() => setRole("guru")}
              >
                <input
                  type="radio"
                  name="role"
                  value="guru"
                  checked={role === "guru"}
                  onChange={() => setRole("guru")}
                />
                <ShieldCheck size={20} />
                <div className="role-text">
                  <strong>Guru</strong>
                  <span>Buat, ubah & hapus tugas</span>
                </div>
              </label>
            </div>
            {fieldErrors.role && <span className="field-error-text">{fieldErrors.role}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner-icon" /> Mendaftarkan Akun...
              </>
            ) : (
              <>
                <UserPlus size={18} /> Daftar Sekarang
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Sudah memiliki akun? <Link to="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}

