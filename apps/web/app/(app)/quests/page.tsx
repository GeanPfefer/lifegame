import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuestsClient from './_components/QuestsClient';

export default async function QuestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [pillarsRes, questsRes] = await Promise.all([
    supabase
      .from('user_pillars')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('quests')
      .select(`
        id, title, description, type, status, xp_reward, pillar_id, created_at, completed_at,
        user_pillars!quests_pillar_id_fkey (name),
        quest_missions (id, title, xp_reward, sort_order, completed_at)
      `)
      .eq('user_id', user.id)
      .neq('status', 'abandoned')
      .order('created_at', { ascending: false }),
  ]);

  const pillars = pillarsRes.data ?? [];
  const rawQuests = questsRes.data ?? [];

  const quests = rawQuests.map((q: any) => ({
    id:           q.id,
    title:        q.title,
    description:  q.description,
    type:         q.type,
    status:       q.status,
    xp_reward:    q.xp_reward,
    pillar_id:    q.pillar_id,
    pillar_name:  q.user_pillars?.name ?? '',
    created_at:   q.created_at,
    completed_at: q.completed_at,
    missions: (q.quest_missions ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  }));

  return <QuestsClient userId={user.id} initialQuests={quests} pillars={pillars} />;
}
