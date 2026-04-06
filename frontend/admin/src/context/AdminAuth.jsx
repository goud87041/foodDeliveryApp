import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    const stored = localStorage.getItem("admin_profile");
    if (t && stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_profile");
      }
    }
    setLoading(false);
  }, []);

  function login(token, a) {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_profile", JSON.stringify(a));
    setAdmin(a);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    setAdmin(null);
  }

  return <Ctx.Provider value={{ admin, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  return useContext(Ctx);
}
