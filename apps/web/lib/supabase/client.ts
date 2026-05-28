import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@lifegame/types';

let instance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Singleton — evita criar um cliente novo a cada render em componentes cliente.
// Usa createBrowserClient do @supabase/ssr para ler a sessão dos cookies,
// em sincronia com o servidor que também usa cookies via createServerClient.
export function createClient() {
  if (instance) return instance;
  instance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return instance;
}
