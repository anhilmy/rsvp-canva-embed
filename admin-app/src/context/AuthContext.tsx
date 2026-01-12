import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  websiteId: string | null;
  apiKey: string | null;
  login: (websiteId: string, apiKey: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedWebsiteId = localStorage.getItem("admin_website_id");
    const storedApiKey = localStorage.getItem("admin_api_key");

    if (storedWebsiteId && storedApiKey) {
      setWebsiteId(storedWebsiteId);
      setApiKey(storedApiKey);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (wid: string, key: string) => {
    localStorage.setItem("admin_website_id", wid);
    localStorage.setItem("admin_api_key", key);
    setWebsiteId(wid);
    setApiKey(key);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_website_id");
    localStorage.removeItem("admin_api_key");
    setWebsiteId(null);
    setApiKey(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, websiteId, apiKey, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
