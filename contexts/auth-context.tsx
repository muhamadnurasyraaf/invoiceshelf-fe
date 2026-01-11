"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  authService,
  User,
  LoginCredentials,
  RegisterCredentials,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isUser: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const { user } = await authService.getMe();
          setUser(user);
          authService.setUser(user);
        } catch {
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    authService.setToken(response.token);
    authService.setUser(response.user);
    setUser(response.user);

    // Redirect based on role
    if (response.user.role === "customer") {
      router.push("/portal");
    } else {
      router.push("/dashboard");
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await authService.register(credentials);
    authService.setToken(response.token);
    authService.setUser(response.user);
    setUser(response.user);
    router.push("/dashboard");
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isCustomer: user?.role === "customer",
        isUser: user?.role === "user",
        login,
        register,
        logout,
      }}
    >
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
