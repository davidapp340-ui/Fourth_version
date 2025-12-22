import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Child = Database['public']['Tables']['children']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  child: Child | null;
  isParent: boolean;
  isChild: boolean;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  linkChildWithCode: (code: string, deviceId: string) => Promise<{ child?: Child; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CHILD_STORAGE_KEY = '@zoomi_child_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        checkChildSession();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        setChild(null);
      } else {
        setProfile(null);
        checkChildSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkChildSession = async () => {
    try {
      const childId = await AsyncStorage.getItem(CHILD_STORAGE_KEY);
      if (childId) {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setChild(data);
        } else {
          await AsyncStorage.removeItem(CHILD_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error checking child session:', error);
      await AsyncStorage.removeItem(CHILD_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(CHILD_STORAGE_KEY);
    setProfile(null);
    setChild(null);
  };

  const linkChildWithCode = async (code: string, deviceId: string) => {
    try {
      const { data: childData, error: fetchError } = await supabase
        .from('children')
        .select('*')
        .eq('linking_code', code)
        .gt('linking_code_expires_at', new Date().toISOString())
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!childData) {
        return { error: { message: 'Invalid or expired code' } };
      }

      const { data: updatedChild, error: updateError } = await supabase
        .from('children')
        .update({ device_id: deviceId })
        .eq('id', childData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await AsyncStorage.setItem(CHILD_STORAGE_KEY, updatedChild.id);
      setChild(updatedChild);

      return { child: updatedChild };
    } catch (error) {
      return { error };
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    child,
    isParent: !!profile,
    isChild: !!child,
    loading,
    signUp,
    signIn,
    signOut,
    linkChildWithCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
