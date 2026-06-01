import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { getCharacterLevel, getEraForLevel, getTotalXPForLevel, getXPToNextLevel } from '@anima/core';
import LifeRadar from '@/components/LifeRadar';
import LogActivityModal from '@/components/LogActivityModal';
import { colors, spacing, radius } from '@/constants/theme';

type PillarRow = {
  id: string;
  name: string;
  xp_rate: number;
  xp_total: number;
  level: number;
  is_priority: boolean;
};

type Profile = { name: string };

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pillars, setPillars] = useState<PillarRow[]>([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [profileRes, pillarsRes] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', user.id).single(),
      supabase
        .from('user_pillars')
        .select('id, name, xp_rate, xp_total, level, is_priority')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order'),
    ]);

    setProfile(profileRes.data ?? null);
    setPillars(pillarsRes.data ?? []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const characterLevel = getCharacterLevel(pillars.map((p) => p.level));
  const era = getEraForLevel(characterLevel);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile?.name ?? ''}</Text>
          <View style={styles.characterMeta}>
            <Text style={styles.level}>Nível {characterLevel}</Text>
            <Text style={styles.separator}>·</Text>
            <Text style={styles.era}>{era.name}</Text>
          </View>
        </View>

        {/* Radar */}
        <Text style={styles.sectionLabel}>Radar de vida</Text>
        <View style={styles.radarWrapper}>
          {pillars.length >= 3
            ? <LifeRadar pillars={pillars} />
            : <Text style={styles.empty}>Nenhum pilar registrado.</Text>
          }
        </View>

        {/* Pilares */}
        <Text style={styles.sectionLabel}>Pilares</Text>
        {pillars.length === 0 ? (
          <Text style={styles.empty}>Complete o onboarding para ver seus pilares.</Text>
        ) : (
          <View style={styles.pillarList}>
            {pillars.map((p) => {
              const levelStart = getTotalXPForLevel(p.level);
              const levelEnd = getTotalXPForLevel(p.level + 1);
              const progress =
                levelEnd > levelStart
                  ? Math.max(0, Math.min(1, (p.xp_total - levelStart) / (levelEnd - levelStart)))
                  : 1;
              const xpToNext = getXPToNextLevel(p.xp_total);

              return (
                <View key={p.id} style={[styles.pillarCard, p.is_priority && styles.pillarCardPriority]}>
                  <View style={styles.pillarTop}>
                    <Text style={styles.pillarName}>{p.name}</Text>
                    <Text style={styles.pillarLevel}>Nv. {p.level}</Text>
                  </View>
                  <View style={styles.xpBarTrack}>
                    <View style={[styles.xpBarFill, { width: `${(progress * 100).toFixed(1)}%` as `${number}%` }]} />
                  </View>
                  <View style={styles.pillarBottom}>
                    <Text style={styles.xpTotal}>
                      {p.xp_total.toLocaleString('pt-BR')} XP
                    </Text>
                    {p.level < 50 && (
                      <Text style={styles.xpToNext}>+{xpToNext} para Nv. {p.level + 1}</Text>
                    )}
                    {p.is_priority && <Text style={styles.priorityBadge}>foco</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Espaço para o FAB não cobrir o último item */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {userId && (
        <LogActivityModal
          userId={userId}
          pillars={pillars.map((p) => ({ id: p.id, name: p.name, xp_rate: p.xp_rate }))}
          onSuccess={load}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingTop: spacing.lg + 16 },
  header: { marginBottom: spacing.xl },
  name: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  characterMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
  level: { fontSize: 15, color: colors.accent, fontWeight: '600' },
  separator: { color: colors.textMuted, fontSize: 15 },
  era: { fontSize: 15, color: colors.textSecondary },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  radarWrapper: { alignItems: 'center', marginBottom: spacing.xl },
  empty: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: spacing.xl },
  pillarList: { gap: spacing.sm },
  pillarCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pillarCardPriority: { borderColor: colors.accent },
  pillarTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  pillarName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  pillarLevel: { fontSize: 13, color: colors.textSecondary },
  xpBarTrack: {
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  xpBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  pillarBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  xpTotal: { fontSize: 13, color: colors.textSecondary },
  xpToNext: { fontSize: 12, color: colors.textMuted },
  priorityBadge: {
    fontSize: 11,
    color: colors.accent,
    backgroundColor: colors.accentSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
});
