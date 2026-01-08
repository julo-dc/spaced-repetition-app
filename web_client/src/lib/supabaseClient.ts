import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== 'undefined') {
  console.group('🛡️ Supabase Initialization Diagnostic');
  console.log('URL defined:', !!supabaseUrl);
  console.log('Publishable Key defined:', !!process.env.SUPABASE_PUBLISHABLE_KEY);
  console.log('Anon Key defined:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('Using key type:', process.env.SUPABASE_PUBLISHABLE_KEY ? 'PUBLISHABLE' : 'ANON');
  if (supabaseUrl) {
    console.log('URL:', supabaseUrl.substring(0, 25) + '...');
  }
  console.groupEnd();
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase environment variables are missing! Check .env.local and restart dev server.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
