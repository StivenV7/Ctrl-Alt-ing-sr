'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { PublicProfile } from '@/lib/types';
import { updatePublicProfile as updatePublicProfileInDb, removePublicProfile as removePublicProfileFromDb } from '@/lib/supabase-service';

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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setTheme: (theme: 'light' | 'blue' | 'pink') => void;
  userData: UserData | null;
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
  
  const setTheme = (theme: 'light' | 'blue' | 'pink') => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
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

  const value = {
    user,
    session,
    userData,
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
