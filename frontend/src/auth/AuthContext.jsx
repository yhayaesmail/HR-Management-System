import { createContext, useContext, useEffect, useState } from "react";
import { api, clearSession, getUser, setSession } from "../api/client.js";
import { disconnectSocket } from "../api/socket.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [ready] = useState(true);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "hr_user" || e.key === "hr_access_token") {
        disconnectSocket();
        setUser(getUser());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const adopt = (data) => {
    disconnectSocket();
    setSession({ accessToken: data.accessToken, user: data.user });
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    disconnectSocket();
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    return adopt(data.data);
  };

  const logout = async () => {
    disconnectSocket();
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
    }
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, adopt }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}