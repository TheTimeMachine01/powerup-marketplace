import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isStaff: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
