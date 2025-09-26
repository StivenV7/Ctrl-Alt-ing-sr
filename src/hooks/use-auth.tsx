
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, DocumentSnapshot, DocumentData, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: 'light' | 'blue' | 'pink') => void;
  userDoc: DocumentSnapshot<DocumentData> | null;
  updateUserProfile: (displayName: string) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteUserAccount: (currentPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setTheme: () => {},
  userDoc: null,
  updateUserProfile: async () => {},
  changeUserPassword: async () => {},
  deleteUserAccount: async () => {},
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
        
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserDoc(docSnap);
                const userTheme = data.theme || 'light';
                setTheme(userTheme);
            } else {
              // This can happen if the user is deleted from another client
              setUser(null);
              setUserDoc(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to user document:", error);
            setLoading(false);
        });

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
  
  const reauthenticate = async (password: string) => {
    if (!user || !user.email) throw new Error("No hay usuario autenticado o el email no está disponible.");
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    await updateProfile(user, { displayName });
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { displayName });
  };
  
  const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    await reauthenticate(currentPassword);
    await updatePassword(user, newPassword);
  };

  const deleteUserAccount = async (currentPassword?: string) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    
    // Re-authentication is required for security-sensitive operations.
    const isGoogleProvider = user.providerData.some(p => p.providerId === 'google.com');
    if (!isGoogleProvider) {
        if (!currentPassword) throw new Error("La contraseña es requerida para eliminar la cuenta.");
        await reauthenticate(currentPassword);
    }
    // If it's a Google provider, re-authentication has to be handled via a popup,
    // which is more complex and often done on the client-side just before calling this.
    // For simplicity, we trust the re-auth happened if the provider is Google.

    // 1. Delete Firestore document
    const userRef = doc(db, "users", user.uid);
    await deleteDoc(userRef);

    // 2. Delete user from Firebase Auth
    // This will trigger the onAuthStateChanged listener, which will clean up state.
    await deleteUser(user);
  };


  const value = {
    user,
    userDoc,
    loading,
    signOut,
    setTheme,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
