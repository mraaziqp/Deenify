'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'student' | 'teacher' | 'verifier' | 'admin';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const roles: UserRole[] = ['student', 'teacher', 'verifier', 'admin'];

    // TODO: Check for existing session (from cookie, localStorage, etc.)
    // For now, simulate checking auth state
    const checkAuth = async () => {
      try {
        // Example: const session = await fetch('/api/auth/session');
        // const data = await session.json();
        // setUser(data.user);

        // Mock user for development - remove this in production
        const mockUser: User = {
          id: 'dev-user-1',
          name: 'Abdullah',
          email: 'abdullah@deenify.com',
          role: 'student',
        };

        const storedRole = typeof window !== 'undefined'
          ? localStorage.getItem('devRole')
          : null;
        if (storedRole && roles.includes(storedRole as UserRole)) {
          mockUser.role = storedRole as UserRole;
        }

        setUser(mockUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    const handleRoleChange = () => {
      const storedRole = localStorage.getItem('devRole');
      if (!storedRole || !roles.includes(storedRole as UserRole)) return;
      setUser((prev) => (prev ? { ...prev, role: storedRole as UserRole } : prev));
    };

    checkAuth();
    if (typeof window !== 'undefined') {
      window.addEventListener('devRoleChanged', handleRoleChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devRoleChanged', handleRoleChange);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Implement actual sign in logic
      // const response = await fetch('/api/auth/signin', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      // setUser(data.user);
      
      console.log('Sign in:', email, password);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // TODO: Implement actual sign out logic
      // await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const hasRole = (role: UserRole) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has all permissions
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
