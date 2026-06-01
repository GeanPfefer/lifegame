import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Não autorizado', { status: 401 });

  await supabase.from('ai_conversations').delete().eq('user_id', user.id);

  return new Response(null, { status: 204 });
}
