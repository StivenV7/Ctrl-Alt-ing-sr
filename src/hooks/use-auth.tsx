
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: 'light' | 'blue' | 'pink') => void;
  userDoc: DocumentSnapshot<DocumentData> | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setTheme: () => {},
  userDoc: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAndCreateUserDocument = async (currentUser: User) => {
    const userRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(userRef);

    let userTheme: 'light' | 'blue' | 'pink' = 'light';
    
    if (docSnap.exists()) {
      userTheme = docSnap.data().theme || 'light';
      setUserDoc(docSnap);
    } else {
       console.log("Creating new user document in use-auth");
       await setDoc(userRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Usuario',
        email: currentUser.email,
        theme: 'light', // Default theme
        xp: 0,
        habits: [],
        followedCategoryIds: [],
       });
       const newDocSnap = await getDoc(userRef);
       setUserDoc(newDocSnap);
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
        setUserDoc(null);
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
  };

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, signOut, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
