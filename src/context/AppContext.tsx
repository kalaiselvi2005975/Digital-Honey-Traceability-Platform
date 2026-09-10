import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '../models/User';
import { authService } from '../services/authService';

interface AppContextType {
  session: Session | null;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (payload: {
    email: string;
    password: string;
    password_confirm: string;
    name: string;
    role?: string;
    apiary_name?: string;
    location?: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('honeytrace_access');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const user = await authService.me();
        setSession({
          user,
          token,
          loginAt: new Date().toISOString(),
        });
      } catch {
        authService.logout();
        setSession(null);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { user, access } = await authService.login(email, password);
      const newSession: Session = {
        user,
        token: access,
        loginAt: new Date().toISOString(),
      };
      setSession(newSession);
      return { success: true, user };
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : 'Invalid email or password.';
      const message = /failed to fetch|networkerror|load failed/i.test(raw)
        ? 'Cannot reach the server. Keep the backend running (python manage.py runserver) and refresh the page.'
        : raw;
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (payload: {
    email: string;
    password: string;
    password_confirm: string;
    name: string;
    role?: string;
    apiary_name?: string;
    location?: string;
  }): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      await authService.register(payload);
      return login(payload.email, payload.password);
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : 'Unable to create account.';
      const message = /failed to fetch|networkerror|load failed/i.test(raw)
        ? 'Cannot reach the server. Keep the backend running (python manage.py runserver) and refresh the page.'
        : raw;
      return { success: false, error: message };
    }
  }, [login]);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  return (
    <AppContext.Provider value={{ session, user: session?.user ?? null, login, register, logout, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
