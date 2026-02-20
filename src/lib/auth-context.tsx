import React, { useEffect, useState, useCallback, useContext, createContext } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  const hasRole = useCallback((role: string) => {
    return user && user.role === role;
  }, [user]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    setUser(null);
  }, []);

  const value = { user, hasRole, isLoading, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
