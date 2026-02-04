import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create an untyped client for tables not yet in generated types
export const db = createClient(supabaseUrl, supabaseAnonKey);
