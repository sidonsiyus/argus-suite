export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return false;
  }

  // Check if still default placeholder values
  if (
    url.includes('your-project-id') ||
    anonKey.includes('your-supabase-anon-key')
  ) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
