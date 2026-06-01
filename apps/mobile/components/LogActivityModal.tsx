import { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { calculateBonusMultiplier } from '@anima/core';
import { getActivityBonuses, logActivity } from '@/lib/activity';
import type { ActivityBonusType } from '@anima/types';
import { colors, spacing, radius } from '@/constants/theme';

type Pillar = { id: string; name: string; xp_rate: number };

const BONUS_LABELS: Record<ActivityBonusType, string> = {
  first_of_day:     'Primeiro do dia',
  forgotten_pillar: 'Pilar esquecido',
  active_streak:    'Sequência ativa',
  active_quest:     'Quest ativa',
};

const BONUS_PCT: Record<ActivityBonusType, number> = {
  first_of_day:     20,
  forgotten_pillar: 50,
  active_streak:    30,
  active_quest:     40,
};

const DURATION_PRESETS = [15, 30, 45, 60, 90];

type Props = {
  userId: string;
  pillars: Pillar[];
  onSuccess: () => void;
};

export default function LogActivityModal({ userId, pillars, onSuccess }: Props) {
  const [open, setOpen]                     = useState(false);
  const [selectedId, setSelectedId]         = useState('');
  const [duration, setDuration]             = useState(30);
  const [note, setNote]                     = useState('');
  const [bonusCache, setBonusCache]         = useState<Record<string, ActivityBonusType[]>>({});
  const [loadingBonuses, setLoadingBonuses] = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [successXP, setSuccessXP]           = useState<number | null>(null);
  const [errorMsg, setErrorMsg]             = useState('');

  const handlePillarSelect = useCallback(async (id: string) => {
    setSelectedId(id);
    if (bonusCache[id] !== undefined) return;
    setLoadingBonuses(true);
    const bonuses = await getActivityBonuses(id, userId);
    setBonusCache((prev) => ({ ...prev, [id]: bonuses }));
    setLoadingBonuses(false);
  }, [bonusCache, userId]);

  function handleClose() {
    setOpen(false);
    setSelectedId('');
    setDuration(30);
    setNote('');
    setSuccessXP(null);
    setErrorMsg('');
  }

  async function handleSubmit() {
    if (!selectedId || duration <= 0) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { totalXP } = await logActivity({ userId, pillarId: selectedId, durationMinutes: duration, note });
      setSuccessXP(totalXP);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1800);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao registrar');
    } finally {
      setSubmitting(false);
    }
  }

  const currentBonuses = bonusCache[selectedId] ?? [];
  const selectedPillar = pillars.find((p) => p.id === selectedId);

  const xpPreview = selectedPillar && duration > 0
    ? (() => {
        const baseXP = Math.round(duration * selectedPillar.xp_rate);
        const multiplier = calculateBonusMultiplier(currentBonuses);
        return { baseXP, multiplier, totalXP: Math.round(baseXP * multiplier) };
      })()
    : null;

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+ Registrar atividade</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={handleClose}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.backdropTouch} onPress={handleClose} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Nova atividade</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
              {successXP !== null ? (
                <View style={styles.successBox}>
                  <Text style={styles.successXP}>+{successXP} XP</Text>
                  <Text style={styles.successMsg}>Atividade registrada!</Text>
                </View>
              ) : (
                <>
                  {/* Pilar */}
                  <Text style={styles.sectionLabel}>Pilar</Text>
                  <View style={styles.pillarGrid}>
                    {pillars.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.pill, selectedId === p.id && styles.pillActive]}
                        onPress={() => handlePillarSelect(p.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.pillText, selectedId === p.id && styles.pillTextActive]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Tempo */}
                  <Text style={styles.sectionLabel}>Tempo</Text>
                  <View style={styles.durationRow}>
                    {DURATION_PRESETS.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.durationChip, duration === d && styles.durationChipActive]}
                        onPress={() => setDuration(d)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
                          {d}min
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TextInput
                      style={styles.durationInput}
                      value={String(duration)}
                      onChangeText={(v) => setDuration(Math.max(1, Math.min(480, Number(v) || 1)))}
                      keyboardType="number-pad"
                      selectTextOnFocus
                    />
                  </View>

                  {/* Preview XP */}
                  {selectedPillar && (
                    <View style={styles.xpCard}>
                      {loadingBonuses ? (
                        <ActivityIndicator color={colors.accent} />
                      ) : xpPreview ? (
                        <>
                          <Text style={styles.xpBase}>
                            {duration}min × {selectedPillar.xp_rate} = {xpPreview.baseXP} XP base
                          </Text>
                          {currentBonuses.map((b) => (
                            <Text key={b} style={styles.xpBonus}>
                              ⚡ {BONUS_LABELS[b]}  <Text style={styles.xpBonusPct}>+{BONUS_PCT[b]}%</Text>
                            </Text>
                          ))}
                          <Text style={styles.xpTotal}>
                            {xpPreview.totalXP} XP
                            {xpPreview.multiplier > 1 && (
                              <Text style={styles.xpMultiplier}> ×{xpPreview.multiplier.toFixed(2)}</Text>
                            )}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  )}

                  {/* Nota */}
                  <Text style={styles.sectionLabel}>
                    Nota <Text style={styles.optional}>(opcional)</Text>
                  </Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="O que você fez? Como foi?"
                    placeholderTextColor={colors.textMuted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={2}
                  />

                  {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

                  <TouchableOpacity
                    style={[styles.submitBtn, (!selectedId || duration <= 0 || submitting) && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!selectedId || duration <= 0 || submitting}
                    activeOpacity={0.85}
                  >
                    {submitting
                      ? <ActivityIndicator color="#ffffff" />
                      : <Text style={styles.submitBtnText}>Registrar</Text>
                    }
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  backdrop: { flex: 1 },
  backdropTouch: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  closeBtn: { fontSize: 16, color: colors.textSecondary },
  sheetContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  pillarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.bgElevated,
  },
  pillActive: { borderColor: colors.accent, backgroundColor: colors.accentSubtle },
  pillText: { color: colors.textSecondary, fontSize: 13 },
  pillTextActive: { color: colors.accent, fontWeight: '600' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  durationChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.bgElevated,
  },
  durationChipActive: { borderColor: colors.accent, backgroundColor: colors.accentSubtle },
  durationChipText: { color: colors.textSecondary, fontSize: 13 },
  durationChipTextActive: { color: colors.accent, fontWeight: '600' },
  durationInput: {
    width: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    color: colors.textPrimary,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: colors.bgElevated,
  },
  xpCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  xpBase: { color: colors.textSecondary, fontSize: 13 },
  xpBonus: { color: colors.textPrimary, fontSize: 13 },
  xpBonusPct: { color: colors.success, fontWeight: '600' },
  xpTotal: { color: colors.accent, fontSize: 20, fontWeight: '700', marginTop: 4 },
  xpMultiplier: { color: colors.accentHover, fontSize: 14, fontWeight: '500' },
  noteInput: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  optional: { color: colors.textMuted, fontWeight: '400' },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center', marginTop: spacing.sm },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  successBox: { alignItems: 'center', paddingVertical: spacing.xxl },
  successXP: { fontSize: 40, fontWeight: '700', color: colors.accent },
  successMsg: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.sm },
});
