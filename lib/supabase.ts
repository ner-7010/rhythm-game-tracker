import { createClient } from '@supabase/supabase-js';

export const cleanSupabaseUrl = (rawUrl?: string): string => {
  if (!rawUrl || !rawUrl.trim()) return 'https://placeholder.supabase.co';
  let clean = rawUrl.trim().replace(/^["']|["']$/g, '').trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  // remove trailing slashes
  return clean.replace(/\/+$/, '');
};

export const cleanSupabaseKey = (rawKey?: string): string => {
  if (!rawKey || !rawKey.trim()) return 'placeholder-anon-key';
  return rawKey.trim().replace(/^["']|["']$/g, '').trim();
};

export const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
export const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabaseUrl = cleanSupabaseUrl(rawUrl);
export const supabaseAnonKey = cleanSupabaseKey(rawKey);

export const isSupabaseConfigured = () => {
  return (
    !!rawUrl &&
    !supabaseUrl.includes('placeholder') &&
    !!rawKey &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const getSupabaseClient = () => {
  const url = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const key = cleanSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);




