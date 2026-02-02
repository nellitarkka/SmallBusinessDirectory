import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI } from "../services/api";

type Role = "customer" | "vendor" | "admin";

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  businessName?: string;
  city?: string;
  vatNumber?: string;
};

export interface AuthUser {
  id: number;
  role: Role;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const mapBackendUserToAuthUser = (u: any): AuthUser => ({
    id: u.id,
    role: u.role,
    email: u.email,
    name: [u.firstName, u.lastName].filter(Boolean).join(" "),
  });

  const login = async (email: string, password: string, role?: Role) => {
    const response = await authAPI.login(email, password, role);
    if (response.status === "success") {
      const mapped = mapBackendUserToAuthUser(response.data.user);
      setUser(mapped);
      localStorage.setItem("user", JSON.stringify(mapped));
    } else {
      throw new Error(response.message || "Login failed");
    }
  };
  
  const register = async (payload: RegisterPayload) => {
    const response = await authAPI.register(payload);
    if (response.status === "success") {
      const mapped = mapBackendUserToAuthUser(response.data.user);
      setUser(mapped);
      localStorage.setItem("user", JSON.stringify(mapped));
    } else {
      throw new Error(response.message || "Registration failed");
    }
  };
  

  const updateProfile = async (updates: Partial<AuthUser>) => {
    const name = (updates.name || "").trim();
    if (!name) return;
  
    const res = await authAPI.updateProfile({ name });
  
    const mapped = mapBackendUserToAuthUser(res.data.user);
  
    setUser(mapped);
    localStorage.setItem("user", JSON.stringify(mapped));
  };
  
  
  

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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