'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


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

  const checkAndCreateUserDocument = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    let userTheme: 'light' | 'blue' | 'pink' = 'light';
    if (docSnap.exists()) {
      userTheme = docSnap.data().theme || 'light';
    } else {
       console.log("Creating new user document in use-auth");
      // Document doesn't exist, so this is a new or returning user without a doc.
      // Let's create one.
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'Usuario',
        email: user.email,
        theme: 'light', // Default theme
        xp: 0,
        goals: 'Mejorar mi constancia y bienestar general.',
        habits: [],
      });
    }
    setTheme(userTheme);
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        await checkAndCreateUserDocument(user);
        setUser(user);
      } else {
        setUser(null);
        // On signout, reset to default theme
        setTheme('light');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const setTheme = (theme: 'light' | 'blue' | 'pink') => {
    if (typeof window !== "undefined") {
      localStorage.setItem('habitica-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // State change will be handled by onAuthStateChanged listener
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
