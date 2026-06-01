import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { buildActivePillars } from '@anima/core';
import { supabase } from '@/lib/supabase';
import { useOnboarding } from '@/contexts/onboarding-context';
import { colors, spacing, radius } from '@/constants/theme';

export default function Step3Screen() {
  const { state } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePillars = buildActivePillars(state.selectedPillarIds, state.customPillars);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Usuário não autenticado.');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: state.name.trim(),
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (profileError) throw profileError;

      const pillarRows = activePillars.map((pillar, index) => ({
        user_id: user.id,
        catalog_id: pillar.isDefault ? pillar.id : null,
        name: pillar.name,
        xp_rate: pillar.xpRate,
        sort_order: index,
      }));

      const { error: pillarsError } = await supabase.from('user_pillars').insert(pillarRows);
      if (pillarsError) throw pillarsError;

      // Força o useAuth no root _layout a re-buscar o perfil atualizado.
      // O _layout detecta onboarding_completed_at e redireciona para home automaticamente.
      await supabase.auth.refreshSession();
      // Não navega aqui — loading fica ativo até o redirect substituir a tela.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.progress}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={[styles.dot, n === 3 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Etapa 3 de 3</Text>
      </View>

      <Text style={styles.title}>Pronto, {state.name || 'Jogador'}!</Text>
      <Text style={styles.subtitle}>
        Esses são seus pilares. Cada ação registrada constrói seu personagem a partir daqui.
      </Text>

      {/* Card do personagem */}
      <View style={styles.characterCard}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>1</Text>
          <Text style={styles.levelLabel}>Nível</Text>
        </View>
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{state.name || 'Jogador'}</Text>
          <Text style={styles.era}>Era: Despertar</Text>
        </View>
      </View>

      {/* Pilares ativos */}
      <Text style={styles.sectionTitle}>Pilares ativos</Text>
      <View style={styles.pillarGrid}>
        {activePillars.map((pillar) => (
          <View key={pillar.id} style={styles.pillarItem}>
            <Text style={styles.pillarName}>{pillar.name}</Text>
            <Text style={styles.pillarRate}>{pillar.xpRate}× XP/min</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleStart}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color="#ffffff" />
          : <Text style={styles.buttonText}>Começar a jornada →</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  progress: { flexDirection: 'row', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.accent, width: 24 },
  stepLabel: { color: colors.textMuted, fontSize: 13 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 20 },
  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSubtle,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: { fontSize: 24, fontWeight: '700', color: colors.accent },
  levelLabel: { fontSize: 10, color: colors.accentHover, fontWeight: '500' },
  characterInfo: { flex: 1 },
  characterName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  era: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  pillarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  pillarItem: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minWidth: '44%',
    flex: 1,
  },
  pillarName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  pillarRate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md, textAlign: 'center' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
