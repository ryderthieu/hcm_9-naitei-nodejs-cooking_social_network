import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { LoginDto, User, AuthContextProps } from "../types/auth.type";
import {
  login as loginApi,
  logout as logoutApi,
} from "../services/auth.service";
import { getCurrentUser } from "../services/user.service";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser: User = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (loginDto: LoginDto) => {
    try {
      const data = await loginApi(loginDto);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
