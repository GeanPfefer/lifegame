import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@lifegame/types';

let instance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

// Singleton — evita criar um cliente novo a cada render em componentes cliente.
export function createClient() {
  if (instance) return instance;
  instance = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return instance;
}
