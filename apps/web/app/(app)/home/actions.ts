'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateBonusMultiplier } from '@anima/core';
import type { ActivityBonusType } from '@anima/types';

export async function getActivityBonuses(pillarId: string): Promise<ActivityBonusType[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const bonuses: ActivityBonusType[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // first_of_day: nenhum registro hoje (qualquer pilar)
  const { count: todayCount } = await supabase
    .from('xp_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart);

  if ((todayCount ?? 0) === 0) bonuses.push('first_of_day');

  // forgotten_pillar: nenhum registro neste pilar nos últimos 5 dias
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from('xp_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('pillar_id', pillarId)
    .gte('created_at', fiveDaysAgo);

  if ((recentCount ?? 0) === 0) bonuses.push('forgotten_pillar');

  // active_streak: registro neste pilar em cada um dos 6 dias anteriores (7º dia consecutivo)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: streakRecords } = await supabase
    .from('xp_records')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('pillar_id', pillarId)
    .gte('created_at', sevenDaysAgo)
    .lt('created_at', todayStart);

  const daysWithRecords = new Set(
    (streakRecords ?? []).map(r => r.created_at.slice(0, 10))
  );

  let hasStreak = true;
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    if (!daysWithRecords.has(dayStr)) { hasStreak = false; break; }
  }
  if (hasStreak) bonuses.push('active_streak');

  return bonuses;
}

export async function logActivity(data: {
  pillarId: string;
  durationMinutes: number;
  note: string;
}): Promise<{ totalXP: number; bonuses: ActivityBonusType[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: pillar } = await supabase
    .from('user_pillars')
    .select('xp_rate')
    .eq('id', data.pillarId)
    .eq('user_id', user.id)
    .single();

  if (!pillar) throw new Error('Pilar não encontrado');

  const bonuses = await getActivityBonuses(data.pillarId);
  const baseXP = Math.round(data.durationMinutes * pillar.xp_rate);
  const bonusMultiplier = calculateBonusMultiplier(bonuses);
  const totalXP = Math.round(baseXP * bonusMultiplier);

  const { error } = await supabase.from('xp_records').insert({
    user_id: user.id,
    pillar_id: data.pillarId,
    duration_minutes: data.durationMinutes,
    base_xp: baseXP,
    bonus_multiplier: bonusMultiplier,
    total_xp: totalXP,
    bonuses,
    note: data.note || null,
  });

  if (error) throw new Error(error.message);

  return { totalXP, bonuses };
}
