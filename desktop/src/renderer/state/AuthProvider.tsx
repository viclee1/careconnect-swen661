import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
}

/** Who is using the app: the person cared for, or someone caring for them. */
export type Role = 'patient' | 'caregiver';

export interface AuthValue {
  user: User | null;
  isSignedIn: boolean;
  /** Null until chosen after signing in. */
  role: Role | null;
  setRole: (role: Role) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

const STORAGE_KEY = 'careconnect_desktop_user';
const ROLE_KEY = 'careconnect_desktop_role';
const DEFAULT_USER_NAME = 'Margaret Whitfield';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [role, setRoleState] = useState<Role | null>(() => {
    try {
      const stored = localStorage.getItem(ROLE_KEY);
      return stored === 'patient' || stored === 'caregiver' ? stored : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (role) {
        localStorage.setItem(ROLE_KEY, role);
      } else {
        localStorage.removeItem(ROLE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [role]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [user]);

  const signIn = useCallback(async (email: string, _password: string) => {
    if (!email.trim()) {
      return { error: 'Please enter a valid email address.' };
    }
    // Do not change user's name based on sign in details
    const newUser: User = {
      name: DEFAULT_USER_NAME,
      email: email.trim().toLowerCase(),
    };
    setUser(newUser);
    return {};
  }, []);

  const signUp = useCallback(async (_name: string, email: string, _password: string) => {
    if (!email.trim()) {
      return { error: 'Please fill in all required fields.' };
    }
    // Do not change user's name based on sign up details
    const newUser: User = {
      name: DEFAULT_USER_NAME,
      email: email.trim().toLowerCase(),
    };
    setUser(newUser);
    return {};
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setRoleState(null);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: Boolean(user),
        role,
        setRole,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return value;
}
