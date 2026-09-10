import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConnected = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('example.supabase.co')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
