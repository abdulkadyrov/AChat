const fallbackUrl = "https://example.supabase.co";
const fallbackKey = "public-anon-key";

function resolveEnvValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

export const env = {
  supabaseUrl: resolveEnvValue(import.meta.env.VITE_SUPABASE_URL, fallbackUrl),
  supabaseKey: resolveEnvValue(import.meta.env.VITE_SUPABASE_KEY, fallbackKey)
};

export const isSupabaseConfigured =
  env.supabaseUrl !== fallbackUrl && env.supabaseKey !== fallbackKey;
