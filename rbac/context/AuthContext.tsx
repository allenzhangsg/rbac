import { useState, useEffect, createContext, useContext } from "react";
import { API_DOMAIN } from "@/config";
import CryptoJS from 'crypto-js';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
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
    try {
      const response = await fetch(`${API_DOMAIN}/api/v1/auth/check`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    }
    setLoading(false);
  };

  const hashPassword = (password: string): string => {
    const salt = CryptoJS.lib.WordArray.random(16);
    const iterations = 100000; // Same as default in passlib
    const keylen = 32; // 256 bits

    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: keylen / 4,
      iterations: iterations,
      hasher: CryptoJS.algo.SHA256
    });

    // Format the hash to match passlib's pbkdf2_sha256 format
    return `$pbkdf2-sha256$${iterations}$${salt.toString()}$${hash.toString()}`;
  };

  const login = async (username: string, password: string) => {
    try {
      const hashedPassword = hashPassword(password);
      const response = await fetch(`${API_DOMAIN}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: hashedPassword }),
        credentials: "include",
      });

      if (response.ok) {
        await checkAuth();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_DOMAIN}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
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