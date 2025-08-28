
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, DocumentSnapshot, DocumentData, onSnapshot, updateDoc } from 'firebase/firestore';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: 'light' | 'blue' | 'pink') => void;
  userDoc: DocumentSnapshot<DocumentData> | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setTheme: () => {},
  userDoc: null,
  isAdmin: false,
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
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
        const unsubDoc = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // --- MIGRATION LOGIC ---
                // If user exists but doesn't have a role, assign 'user' role.
                if (!data.role) {
                  await updateDoc(userRef, { role: 'user' });
                  // The snapshot will update automatically after this, so no need to manually set state here.
                } else {
                  setUserDoc(docSnap);
                  const userRole = data.role || 'user';
                  const userTheme = data.theme || 'light';
                  setIsAdmin(userRole === 'admin');
                  setTheme(userTheme);
                }
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
        setIsAdmin(false);
        setTheme('light');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, signOut, setTheme, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
