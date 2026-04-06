import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export function DeliveryAuthProvider({ children }) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("delivery_token");
    const raw = localStorage.getItem("delivery_profile");
    if (t && raw) {
      try {
        setPartner(JSON.parse(raw));
      } catch {
        localStorage.removeItem("delivery_token");
        localStorage.removeItem("delivery_profile");
      }
    }
    setLoading(false);
  }, []);

  function login(token, p) {
    localStorage.setItem("delivery_token", token);
    localStorage.setItem("delivery_profile", JSON.stringify(p));
    setPartner(p);
  }

  function logout() {
    localStorage.removeItem("delivery_token");
    localStorage.removeItem("delivery_profile");
    setPartner(null);
  }

  return <Ctx.Provider value={{ partner, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useDeliveryAuth() {
  return useContext(Ctx);
}
