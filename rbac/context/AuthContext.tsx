import { useState, useEffect, createContext, useContext } from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  // Add other user properties
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get("auth_token");
    if (token) {
      try {
        const response = await fetch("https://your-api.com/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          Cookies.remove("auth_token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    }
    setLoading(false);
  };

  const login = async (token: string) => {
    Cookies.set("auth_token", token, { secure: true, sameSite: "strict" });
    await checkAuth();
  };

  const logout = () => {
    Cookies.remove("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
