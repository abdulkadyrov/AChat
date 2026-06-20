const fallbackUrl = "https://example.supabase.co";
const fallbackKey = "public-anon-key";

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? fallbackUrl,
  supabaseKey: import.meta.env.VITE_SUPABASE_KEY ?? fallbackKey
};

export const isSupabaseConfigured =
  env.supabaseUrl !== fallbackUrl && env.supabaseKey !== fallbackKey;
