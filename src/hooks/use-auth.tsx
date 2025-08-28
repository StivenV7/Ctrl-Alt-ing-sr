'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: 'light' | 'blue' | 'pink') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setTheme: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // On auth state change, check localStorage for theme
      const storedTheme = localStorage.getItem('habitica-theme') || 'light';
      document.documentElement.setAttribute('data-theme', storedTheme);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const setTheme = (theme: 'light' | 'blue' | 'pink') => {
    localStorage.setItem('habitica-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // On signout, reset to default theme
    setTheme('light');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
