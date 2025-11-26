import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Role = "customer" | "vendor" | "admin";

export interface AuthUser {
  role: Role;
  email: string;
  name?: string; // optional, used by profile page
}

export interface AuthContextType {
  user: AuthUser | null;
  loginAsCustomer: (email: string) => void;
  loginAsVendor: (email: string) => void;
  loginAsAdmin: (email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void; // NEW
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const loginAsCustomer = (email: string) => {
    setUser({ role: "customer", email });
  };

  const loginAsVendor = (email: string) => {
    setUser({ role: "vendor", email });
  };

  const loginAsAdmin = (email: string) => {
    setUser({ role: "admin", email });
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsCustomer,
        loginAsVendor,
        loginAsAdmin,
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
