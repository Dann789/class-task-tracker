import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("tasktracker_token"));
  const [loading, setLoading] = useState(true);

  // Periksa sesi saat inisialisasi aplikasi
  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const response = await api.get("/auth/me");
          if (response.data.success) {
            setUser(response.data.data.user);
          }
        } catch (error) {
          console.error("Gagal memvalidasi token sesi:", error);
          logout();
        }
      }
      setLoading(false);
    }

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.success) {
      const { user: userData, token: jwtToken } = response.data.data;
      localStorage.setItem("tasktracker_token", jwtToken);
      localStorage.setItem("tasktracker_user", JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
  };

  const register = async (name, email, password, role) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    if (response.data.success) {
      const { user: userData, token: jwtToken } = response.data.data;
      localStorage.setItem("tasktracker_token", jwtToken);
      localStorage.setItem("tasktracker_user", JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
  };

  const logout = () => {
    localStorage.removeItem("tasktracker_token");
    localStorage.removeItem("tasktracker_user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isTeacher: user?.role === "guru",
    isStudent: user?.role === "siswa",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}

