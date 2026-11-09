import React from "react";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LogOut, User, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { user, logout, isTeacher } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo-icon">
            <BookOpen size={24} />
          </div>
          <div className="brand-text">
            <h1>Class Task Tracker</h1>
            <span className="brand-sub">Platform Manajemen Tugas Kelas</span>
          </div>
        </div>

        <div className="navbar-user">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className={`role-badge ${isTeacher ? "role-teacher" : "role-student"}`}>
                <ShieldCheck size={12} />
                {isTeacher ? "Guru" : "Siswa"}
              </span>
            </div>
          </div>

          <button onClick={logout} className="btn-logout" title="Keluar dari akun">
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}

