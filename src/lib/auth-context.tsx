export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function useAuth() {
  return { user: null, hasRole: () => false, isLoading: false, signOut: () => {} };
}
