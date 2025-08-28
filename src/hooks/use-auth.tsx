
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, DocumentSnapshot, DocumentData, collection, getDocs, writeBatch, serverTimestamp, query,getCountFromServer } from 'firebase/firestore';


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
    const q = query(categoriesRef);
    const snapshot = await getDocs(q);

    if (snapshot.empty) { // Only seed if the collection is empty
        console.log("No default categories found. Seeding database...");
        const batch = writeBatch(db);
        defaultCategories.forEach(category => {
            const docRef = doc(categoriesRef); // Create a new doc with a random ID
            batch.set(docRef, { 
                ...category,
                createdBy: adminUserId, // Assign the first user as creator
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
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAndCreateUserDocument = async (currentUser: User, isNewUser: boolean = false, userData: Partial<any> = {}) => {
    const userRef = doc(db, 'users', currentUser.uid);
    let docSnap = await getDoc(userRef);

    let userTheme: 'light' | 'blue' | 'pink' = 'light';
    let userRole: 'user' | 'admin' = 'user';
    
    // Check if this is the very first user to determine admin role
    const usersCollection = collection(db, 'users');
    const snapshot = await getCountFromServer(usersCollection);
    const isFirstUser = snapshot.data().count === 0;

    if (!docSnap.exists() && isNewUser) {
       userRole = isFirstUser ? 'admin' : 'user';
       console.log(`User role set to: ${userRole}`);
       // This is a new user, let's also check if we need to seed categories
       await seedDefaultCategories(currentUser.uid);

       await setDoc(userRef, {
        uid: currentUser.uid,
        displayName: userData.displayName || currentUser.displayName || 'Usuario',
        email: userData.email || currentUser.email,
        theme: userData.theme || 'light',
        xp: 0,
        habits: [],
        followedCategoryIds: [],
        role: userRole,
        gender: userData.gender || 'prefer-not-to-say',
       });
       docSnap = await getDoc(userRef);
    }
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        userTheme = data.theme || 'light';
        userRole = data.role || 'user';
        setUserDoc(docSnap);
    }
    
    setIsAdmin(userRole === 'admin');
    setTheme(userTheme);
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // Here we can't be sure if it's a new user from onAuthStateChanged alone.
        // The creation logic is better handled in the sign-up/sign-in flows.
        await checkAndCreateUserDocument(user);
        setUser(user);
      } else {
        setUser(null);
        setUserDoc(null);
        setIsAdmin(false);
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
    <AuthContext.Provider value={{ user, userDoc, loading, signOut, setTheme, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
