import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const SESSION_STORAGE_KEY = 'kwai_session_token';

export interface AuthUser {
  id: Id<'users'>;
  email: string;
  nickname: string;
  tiktokHandle: string;
  investorSlug: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
}

interface AuthContextValue {
  user: AuthUser | null | undefined;
  token: string | null;
  isLoading: boolean;
  showTutorial: boolean;
  login: (token: string, options?: { showTutorial?: boolean }) => void;
  logout: () => Promise<void>;
  startTutorial: () => void;
  dismissTutorial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(SESSION_STORAGE_KEY));
  const [showTutorial, setShowTutorial] = useState(false);
  const [onboardingDismissedLocally, setOnboardingDismissedLocally] = useState(false);
  const user = useQuery(api.auth.getCurrentUser, { token });
  const logoutMutation = useMutation(api.auth.logout);
  const completeOnboardingMutation = useMutation(api.auth.completeOnboarding);

  const login = useCallback((newToken: string, options?: { showTutorial?: boolean }) => {
    localStorage.setItem(SESSION_STORAGE_KEY, newToken);
    setToken(newToken);
    if (options?.showTutorial) {
      setOnboardingDismissedLocally(false);
      window.setTimeout(() => setShowTutorial(true), 350);
    }
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await logoutMutation({ token });
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setToken(null);
    setShowTutorial(false);
  }, [logoutMutation, token]);

  const startTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const dismissTutorial = useCallback(async () => {
    setOnboardingDismissedLocally(true);
    setShowTutorial(false);
    if (token) {
      await completeOnboardingMutation({ token });
    }
  }, [completeOnboardingMutation, token]);

  useEffect(() => {
    if (user?.onboardingCompleted) {
      setOnboardingDismissedLocally(false);
    }
  }, [user?.onboardingCompleted]);

  useEffect(() => {
    if (user && !user.onboardingCompleted && !onboardingDismissedLocally) {
      setShowTutorial(true);
    }
  }, [onboardingDismissedLocally, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading: token !== null && user === undefined,
      showTutorial,
      login,
      logout,
      startTutorial,
      dismissTutorial,
    }),
    [dismissTutorial, login, logout, showTutorial, startTutorial, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
