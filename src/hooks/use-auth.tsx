
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, DocumentSnapshot, DocumentData, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';


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

const defaultCategories = [
    { name: 'Lectura y Crecimiento', description: 'Un espacio para discutir libros, artículos y podcasts que nos ayuden a crecer.' },
    { name: 'Fitness y Salud', description: 'Comparte tus rutinas de ejercicio, recetas saludables y consejos de bienestar.' },
    { name: 'Productividad y Enfoque', description: 'Para los que buscan mejorar su gestión del tiempo y concentración.' },
    { name: 'Meditación y Mindfulness', description: 'Encuentra calma y comparte tus prácticas de meditación y atención plena.' },
    { name: 'Finanzas Personales', description: 'Conversa sobre presupuestos, ahorros, inversiones y cómo alcanzar la libertad financiera.' },
];

// This function will run only once to seed the database with default categories.
const seedDefaultCategories = async (adminUserId: string) => {
    const categoriesRef = collection(db, 'forum_categories');
    const q = await getDocs(categoriesRef);
    if (q.empty) { // Only seed if the collection is empty
        const batch = writeBatch(db);
        defaultCategories.forEach(category => {
            const docRef = doc(categoriesRef);
            batch.set(docRef, { 
                ...category,
                createdBy: adminUserId,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
        console.log("Default forum categories seeded.");
    }
}

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
       // This is a new user, so let's also check if we need to seed categories
       await seedDefaultCategories(currentUser.uid);
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
