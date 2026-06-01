import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { validateStep2 } from '@anima/core';
import { DEFAULT_PILLARS, MIN_ACTIVE_PILLARS } from '@anima/types';
import type { PillarId, PillarConfig } from '@anima/types';
import { useOnboarding } from '@/contexts/onboarding-context';
import { colors, spacing, radius } from '@/constants/theme';

export default function Step2Screen() {
  const router = useRouter();
  const { state, setPillars } = useOnboarding();
  const [error, setError] = useState<string | null>(null);
  const [newPillarName, setNewPillarName] = useState('');

  const totalActive = state.selectedPillarIds.length + state.customPillars.length;

  function toggleDefault(id: PillarId) {
    const isSelected = state.selectedPillarIds.includes(id);
    const newIds = isSelected
      ? state.selectedPillarIds.filter((p) => p !== id)
      : [...state.selectedPillarIds, id];
    setError(null);
    setPillars(newIds, state.customPillars);
  }

  function addCustomPillar() {
    const name = newPillarName.trim();
    if (!name || name.length < 2) return;
    const id = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const pillar: Pick<PillarConfig, 'id' | 'name' | 'xpRate'> = { id, name, xpRate: 1.0 };
    setPillars(state.selectedPillarIds, [...state.customPillars, pillar]);
    setNewPillarName('');
  }

  function removeCustom(id: PillarId) {
    setPillars(
      state.selectedPillarIds,
      state.customPillars.filter((p) => p.id !== id),
    );
  }

  function handleContinue() {
    const err = validateStep2(state.selectedPillarIds, state.customPillars as PillarConfig[]);
    if (err) { setError(err); return; }
    router.push('/(onboarding)/step-3');
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.progress}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={[styles.dot, n === 2 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Etapa 2 de 3</Text>
      </View>

      <Text style={styles.title}>Quais pilares você quer acompanhar?</Text>
      <Text style={styles.subtitle}>
        Selecione pelo menos {MIN_ACTIVE_PILLARS}. Você pode ajustar depois.
      </Text>

      {/* Pilares padrão */}
      <View style={styles.grid}>
        {DEFAULT_PILLARS.map((pillar) => {
          const selected = state.selectedPillarIds.includes(pillar.id);
          return (
            <TouchableOpacity
              key={pillar.id}
              style={[styles.pillarCard, selected && styles.pillarCardSelected]}
              onPress={() => toggleDefault(pillar.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillarName, selected && styles.pillarNameSelected]}>
                {pillar.name}
              </Text>
              <Text style={[styles.pillarRate, selected && styles.pillarRateSelected]}>
                {pillar.xpRate}× XP/min
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pilares customizados */}
      {state.customPillars.length > 0 && (
        <View style={styles.customList}>
          {state.customPillars.map((p) => (
            <View key={p.id} style={styles.customTag}>
              <Text style={styles.customTagText}>{p.name}</Text>
              <TouchableOpacity onPress={() => removeCustom(p.id)} hitSlop={8}>
                <Text style={styles.removeBtn}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Adicionar pilar */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.customInput}
          placeholder="+ Pilar personalizado"
          placeholderTextColor={colors.textMuted}
          value={newPillarName}
          onChangeText={setNewPillarName}
          maxLength={30}
          returnKeyType="done"
          onSubmitEditing={addCustomPillar}
        />
        {newPillarName.trim().length >= 2 && (
          <TouchableOpacity onPress={addCustomPillar} style={styles.addBtn} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Text style={styles.count}>
          {totalActive} pilar{totalActive !== 1 ? 'es' : ''} selecionado{totalActive !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.button, totalActive < MIN_ACTIVE_PILLARS && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={totalActive < MIN_ACTIVE_PILLARS}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pillarCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.bgSurface,
    minWidth: '44%',
    flex: 1,
  },
  pillarCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  pillarName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  pillarNameSelected: { color: colors.accent },
  pillarRate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  pillarRateSelected: { color: colors.accentHover },
  customList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customTagText: { color: colors.textPrimary, fontSize: 13 },
  removeBtn: { color: colors.textMuted, fontSize: 18, lineHeight: 18 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  customInput: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtnText: { color: colors.textSecondary, fontSize: 13 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  footer: { marginTop: spacing.lg },
  count: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: spacing.md },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
