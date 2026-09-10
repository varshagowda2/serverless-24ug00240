import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-publishable-key';

export const isSupabaseConnected = Boolean(
  supabaseUrl && 
  supabasePublishableKey && 
  !supabaseUrl.includes('example.supabase.co')
);

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
