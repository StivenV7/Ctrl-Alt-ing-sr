'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { PublicProfile } from '@/lib/types';
import { updatePublicProfile as updatePublicProfileInDb, removePublicProfile as removePublicProfileFromDb } from '@/lib/supabase-service';

// Extended user type with Firebase-compatible properties
interface User extends SupabaseUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  providerData: Array<{ providerId: string }>;
}

interface UserData {
  id: string;
  email: string | null;
  display_name: string;
  theme: 'light' | 'blue' | 'pink';
  xp: number;
  habits: any[];
  role: 'user' | 'admin';
  gender?: string;
  is_public?: boolean;
}

// Compatibility wrapper for Firebase userDoc structure
interface UserDocWrapper {
  exists: () => boolean;
  data: () => any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: 'light' | 'blue' | 'pink') => void;
  userData: UserData | null;
  userDoc: UserDocWrapper | null; // Compatibility with Firebase
  updateUserProfile: (displayName: string) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteUserAccount: (currentPassword?: string) => Promise<void>;
  updatePublicProfile: (profileData: PublicProfile) => Promise<void>;
  removePublicProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  setTheme: () => {},
  userData: null,
  userDoc: null,
  updateUserProfile: async () => {},
  changeUserPassword: async () => {},
  deleteUserAccount: async () => {},
  updatePublicProfile: async () => {},
  removePublicProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Convert Supabase user to Firebase-compatible user
  const createCompatibleUser = (supabaseUser: SupabaseUser | null, userData: UserData | null): User | null => {
    if (!supabaseUser) return null;
    
    return {
      ...supabaseUser,
      uid: supabaseUser.id,
      displayName: userData?.display_name || null,
      photoURL: supabaseUser.user_metadata?.avatar_url || null,
      providerData: supabaseUser.app_metadata?.providers?.map((p: string) => ({ providerId: p })) || [],
    } as User;
  };
  
  const setTheme = (theme: 'light' | 'blue' | 'pink') => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setUserData(null);
        setTheme('light');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setUserData(data as UserData);
        const userTheme = data.theme || 'light';
        setTheme(userTheme);
        // Set compatible user with userData
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        setUser(createCompatibleUser(supabaseUser, data as UserData));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    
    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName })
      .eq('id', user.id);

    if (error) throw error;
    
    // Refresh user data
    await fetchUserData(user.id);
  };
  
  const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    
    // Supabase requires re-authentication for password change
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  };

  const deleteUserAccount = async (currentPassword?: string) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    
    // 1. Delete public profile if it exists
    await removePublicProfileFromDb(user.id);

    // 2. Delete user data from database
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) throw deleteError;

    // 3. Delete user from auth (requires admin privileges or RPC function)
    // Note: In Supabase, deleting auth users typically requires an RPC function
    const { error: authError } = await supabase.rpc('delete_user');
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Still sign out even if auth deletion fails
    }
    
    await signOut();
  };

  const updatePublicProfile = async (profileData: PublicProfile) => {
    if (!user) throw new Error("No hay usuario autenticado.");
    
    await updatePublicProfileInDb(user.id, profileData);
    
    const { error } = await supabase
      .from('users')
      .update({ is_public: true })
      .eq('id', user.id);

    if (error) throw error;
    
    // Refresh user data
    await fetchUserData(user.id);
  };

  const removePublicProfile = async () => {
    if (!user) throw new Error("No hay usuario autenticado.");
    
    await removePublicProfileFromDb(user.id);
    
    const { error } = await supabase
      .from('users')
      .update({ is_public: false })
      .eq('id', user.id);

    if (error) throw error;
    
    // Refresh user data
    await fetchUserData(user.id);
  };

  // Create a compatibility wrapper for userDoc
  const userDoc: UserDocWrapper | null = userData ? {
    exists: () => !!userData,
    data: () => ({
      uid: userData.id,
      displayName: userData.display_name,
      email: userData.email,
      theme: userData.theme,
      xp: userData.xp,
      habits: userData.habits,
      role: userData.role,
      gender: userData.gender,
      isPublic: userData.is_public,
    }),
  } : null;

  const value = {
    user,
    session,
    userData,
    userDoc,
    loading,
    signOut,
    setTheme,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    updatePublicProfile,
    removePublicProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
