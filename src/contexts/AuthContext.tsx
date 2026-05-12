import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import { AuthContext } from './auth-context-type';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<'admin' | 'office_staff' | 'delivery_handler' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.debug('Note: Could not fetch profile data:', error.message);
        return null;
      }
      return data as Profile | null;
    } catch (err) {
      console.debug('Note: Profile fetch skipped:', err);
      return null;
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      return data?.role || 'customer'; // Default to customer if no role found
    } catch (err) {
      console.error('Error fetching role:', err);
      return null;
    }
  };


  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        await handleSession(initialSession);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await handleSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession?.user) {
      // Parallel fetch for profile and role
      const [profileData, roleData] = await Promise.all([
        fetchProfile(currentSession.user.id),
        fetchUserRole(currentSession.user.id)
      ]);

      setProfile(profileData);
      setRole(roleData as any);

      // Ensure profile exists after fetching (background operation)
      ensureProfileExists(
        currentSession.user.id,
        currentSession.user.email,
        currentSession.user.user_metadata
      );
    } else {
      setProfile(null);
      setRole(null);
    }
  };

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

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('OAuth sign in error:', error);
        return { error };
      }

      // The redirect will happen automatically, but we handle profile creation on auth state change
      return { error: null };
    } catch (err) {
      console.error('OAuth sign in exception:', err);
      return { error: err };
    }
  };

  // Create or update profile for new OAuth users (optional - may not have profiles table yet)
  const ensureProfileExists = async (userId: string, email?: string, metadata?: any) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // If profile doesn't exist, try to create one
      if (!existingProfile) {
        try {
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              user_id: userId,
              email: email,
              full_name: metadata?.full_name || email?.split('@')[0] || 'User',
            });

          if (error) {
            console.debug('Note: Could not create profile:', error.message);
          }
        } catch (insertErr) {
          console.debug('Note: Profile creation skipped:', insertErr);
        }
      } else if (existingProfile && !existingProfile.full_name && metadata?.full_name) {
        // Update name if missing in profile but available in metadata
        await supabase
          .from('profiles')
          .update({ full_name: metadata.full_name })
          .eq('id', userId);
      }
    } catch (err) {
      console.debug('Note: Checking for profile skipped:', err);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setProfile(null);
      setRole(null);
      setSession(null);
      setUser(null);
      // Force reload to clear any persistent states
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      role,
      isAdmin: role === 'admin',
      refreshProfile: async () => {
        if (user) {
          const profileData = await fetchProfile(user.id);
          setProfile(profileData);
        }
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}
