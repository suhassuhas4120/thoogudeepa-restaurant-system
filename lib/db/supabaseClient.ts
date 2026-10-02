import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
