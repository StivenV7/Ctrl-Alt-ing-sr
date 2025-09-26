
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, DocumentSnapshot, DocumentData, onSnapshot, updateDoc } from 'firebase/firestore';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: 'light' | 'blue' | 'pink') => void;
  userDoc: DocumentSnapshot<DocumentData> | null;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setTheme: () => {},
  userDoc: null,
  updateUserProfile: async () => {},
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const setTheme = (theme: 'light' | 'blue' | 'pink') => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        
        // Use onSnapshot to listen for real-time updates to the user document
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserDoc(docSnap);
                const userTheme = data.theme || 'light';
                setTheme(userTheme);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user document:", error);
            setLoading(false);
        });

        // Return the unsubscribe function for the document listener
        return () => unsubDoc();
      } else {
        setUser(null);
        setUserDoc(null);
        setTheme('light');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const signOut = async () => {
    await firebaseSignOut(auth);
  };
  
  const updateUserProfile = async (displayName: string) => {
    if (!user) throw new Error("No hay usuario autenticado.");

    // Update Firebase Auth profile
    await updateProfile(user, { displayName });

    // Update Firestore document
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { displayName });

    // The onSnapshot listener will automatically update the local state.
  };

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, signOut, setTheme, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
