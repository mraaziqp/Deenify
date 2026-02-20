import { useEffect, useState, useCallback } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
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

  return { user, hasRole, isLoading, signOut };
}
