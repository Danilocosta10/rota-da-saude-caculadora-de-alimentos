import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
	console.warn('Configure SUPABASE_URL e SUPABASE_ANON_KEY no ambiente do app.');
}

export const supabase = createClient(
	supabaseUrl || 'https://example.supabase.co',
	supabaseAnonKey || 'missing-anon-key',
);

export default supabase;
