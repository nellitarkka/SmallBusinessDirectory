import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI } from "../services/api";

type Role = "customer" | "vendor" | "admin";

export interface AuthUser {
  id?: number;
  role: Role;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; 
  businessName?: string; 
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    businessName?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      getCurrentUser();
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser({
        id: currentUser.id,
        role: currentUser.role,
        email: currentUser.email,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        name: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
        businessName: currentUser.business_name,
      });
    } catch (err) {
      console.error("Error fetching current user:", err);
      localStorage.removeItem("authToken");
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await authAPI.login(email, password);
      const data = resp && resp.user ? resp.user : resp;
      setUser({
        id: data.id,
        role: data.role,
        email: data.email,
        firstName: data.first_name || data.firstName,
        lastName: data.last_name || data.lastName,
        name: `${data.first_name || data.firstName || ''} ${data.last_name || data.lastName || ''}`.trim(),
        businessName: data.business_name || data.businessName,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error("Error logging in:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    businessName?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await authAPI.register({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: registerData.role,
        businessName: registerData.businessName,
      });
      const data = resp && resp.user ? resp.user : resp;
      setUser({
        id: data.id,
        role: data.role,
        email: data.email,
        firstName: data.first_name || data.firstName,
        lastName: data.last_name || data.lastName,
        name: `${data.first_name || data.firstName || ''} ${data.last_name || data.lastName || ''}`.trim(),
        businessName: data.business_name || data.businessName,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      console.error("Error registering:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
