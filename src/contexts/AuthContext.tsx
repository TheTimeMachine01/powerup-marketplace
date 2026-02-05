import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import { AuthContext } from './auth-context-type';

interface UserRole {
  role: 'admin' | 'office_staff' | 'delivery_handler' | 'customer';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile | null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await db
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      return (data as UserRole[]) || [];
    } catch (err) {
      console.error('Error fetching user roles:', err);
      return [];
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const [profileData, rolesData] = await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
          setProfile(profileData);
          setUserRoles(rolesData);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchUserRoles(session.user.id)
        ]).then(([profileData, rolesData]) => {
          setProfile(profileData);
          setUserRoles(rolesData);
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserRoles([]);
  };

  // Check if user has any staff role
  const isStaff = userRoles.some(r => 
    r.role === 'admin' || 
    r.role === 'office_staff' || 
    r.role === 'delivery_handler'
  );

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isStaff,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
