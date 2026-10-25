import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "@/api/auth";
import { getToken, saveToken, clearToken } from "@/api/client";

// Shares the logged in user with every component. Read it with useAuth().
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      // No token means not logged in, so there's no need to ask the API
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        setUser(await authApi.getMe());
      } catch {
        setUser(null); // not logged in
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Login and register send back a token. Save it, then load the full user
  // details (including their avatar and storage used).
  async function login(email, password) {
    const { token } = await authApi.login(email, password);
    saveToken(token);
    setUser(await authApi.getMe());
  }

  async function register(details) {
    const { token } = await authApi.register(details);
    saveToken(token);
    setUser(await authApi.getMe());
  }

  // Logging out just means forgetting the token
  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// useAuth isn't a component. This rule only affects hot reloading, so it's safe to skip.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
