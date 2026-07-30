import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { authService } from '@/services';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isDealer: boolean;
  isViewer: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  requireAuth: (action: string) => boolean;
  showLoginPrompt: (returnUrl?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [loginPromptUrl, setLoginPromptUrl] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restore = () => {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }
      const stored = authService.getStoredUser();
      if (stored) {
        setUser(stored);
      } else {
        authService.logout();
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: profile } = await authService.login({ email, password });
    setUser(profile);
    
    // If there was a return URL from login prompt, navigate there
    if (loginPromptUrl) {
      window.location.href = loginPromptUrl;
      setLoginPromptUrl(null);
    }
  }, [loginPromptUrl]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setLoginPromptUrl(null);
  }, []);

  /**
   * Check if user is authenticated before allowing an action.
   * Used to guard protected actions for guest users.
   * 
   * @param action - Description of the action (for logging/debugging)
   * @returns true if authenticated, false if guest
   */
  const requireAuth = useCallback((action: string): boolean => {
    if (!user) {
      // Do not log protected action names — information disclosure risk
      void action; // consume the parameter to avoid unused variable warnings
      return false;
    }
    return true;
  }, [user]);

  /**
   * Show login prompt for guest users attempting protected actions.
   * Stores the current URL to return to after successful login.
   * 
   * @param returnUrl - URL to return to after login (defaults to current location)
   */
  const showLoginPrompt = useCallback((returnUrl?: string) => {
    const url = returnUrl || window.location.pathname + window.location.search;
    setLoginPromptUrl(url);
    
    // Navigate to login page with return URL
    window.location.href = `/login?returnUrl=${encodeURIComponent(url)}`;
  }, []);

  const isDealer = user?.role === 'STAFF' || user?.role === 'DEALER';
  const isCustomer = user?.role === 'VIEWER' || user?.role === 'CUSTOMER';

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isGuest: !user,
    isAdmin: user?.role === 'ADMIN',
    isStaff: isDealer,
    isDealer,
    isViewer: isCustomer,
    isCustomer,
    isLoading,
    login,
    logout,
    requireAuth,
    showLoginPrompt,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
