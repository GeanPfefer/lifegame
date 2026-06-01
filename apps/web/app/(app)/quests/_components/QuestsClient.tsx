'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './quests.module.css';

// ─── tipos ────────────────────────────────────────────────────

type QuestType   = 'main' | 'habit' | 'learning' | 'challenge';
type QuestStatus = 'open' | 'in_progress' | 'completed' | 'abandoned';

type Mission = {
  id: string;
  title: string;
  xp_reward: number;
  sort_order: number;
  completed_at: string | null;
};

type Quest = {
  id: string;
  title: string;
  description: string | null;
  type: QuestType;
  status: QuestStatus;
  xp_reward: number;
  pillar_id: string;
  pillar_name: string;
  created_at: string;
  completed_at: string | null;
  missions: Mission[];
};

type Pillar = { id: string; name: string };

// ─── constantes ───────────────────────────────────────────────

const TYPE_LABELS: Record<QuestType, string> = {
  main:      'Principal',
  habit:     'Hábito',
  learning:  'Aprendizado',
  challenge: 'Desafio',
};

const TYPE_COLORS: Record<QuestType, string> = {
  main:      '#7c5cfc',
  habit:     '#22c55e',
  learning:  '#3b82f6',
  challenge: '#f97316',
};

// ─── componente ───────────────────────────────────────────────

export default function QuestsClient({
  userId,
  initialQuests,
  pillars,
}: {
  userId: string;
  initialQuests: Quest[];
  pillars: Pillar[];
}) {
  const supabase = createClient();
  const [quests, setQuests]         = useState<Quest[]>(initialQuests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  async function reload() {
    const { data } = await supabase
      .from('quests')
      .select(`
        id, title, description, type, status, xp_reward, pillar_id, created_at, completed_at,
        user_pillars!quests_pillar_id_fkey (name),
        quest_missions (id, title, xp_reward, sort_order, completed_at)
      `)
      .eq('user_id', userId)
      .neq('status', 'abandoned')
      .order('created_at', { ascending: false });

    if (data) {
      setQuests(data.map((q: any) => ({
        id: q.id, title: q.title, description: q.description,
        type: q.type, status: q.status, xp_reward: q.xp_reward,
        pillar_id: q.pillar_id, pillar_name: q.user_pillars?.name ?? '',
        created_at: q.created_at, completed_at: q.completed_at,
        missions: (q.quest_missions ?? []).sort((a: Mission, b: Mission) => a.sort_order - b.sort_order),
      })));
    }
  }

  async function completeMission(quest: Quest, mission: Mission) {
    const now = new Date().toISOString();
    await supabase.from('quest_missions').update({ completed_at: now }).eq('id', mission.id);
    if (quest.status === 'open') {
      await supabase.from('quests').update({ status: 'in_progress' }).eq('id', quest.id);
    }
    await supabase.from('life_events').insert({
      user_id: userId, pillar_id: quest.pillar_id, quest_id: quest.id,
      mission_id: mission.id, event_type: 'quest_milestone',
      description: `Missão concluída: ${mission.title}`, xp_awarded: mission.xp_reward,
    });
    await reload();
  }

  async function uncompleteMission(missionId: string) {
    await supabase.from('quest_missions').update({ completed_at: null }).eq('id', missionId);
    await reload();
  }

  async function completeQuestDirectly(quest: Quest) {
    const now = new Date().toISOString();
    await supabase.from('quests').update({ status: 'completed', completed_at: now }).eq('id', quest.id);
    await supabase.from('life_events').insert({
      user_id: userId, pillar_id: quest.pillar_id, quest_id: quest.id,
      event_type: 'quest_milestone',
      description: `Quest concluída: ${quest.title}`, xp_awarded: quest.xp_reward,
    });
    await reload();
  }

  async function abandonQuest(questId: string) {
    if (!confirm('Tem certeza que quer abandonar esta quest?')) return;
    await supabase.from('quests').update({ status: 'abandoned' }).eq('id', questId);
    await reload();
  }

  const active    = quests.filter((q) => q.status !== 'completed');
  const completed = quests.filter((q) => q.status === 'completed');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quests</h1>
        <button className={styles.newBtn} onClick={() => setShowCreate(true)}>+ Nova quest</button>
      </div>

      <div className={styles.content}>
        {/* ativas */}
        <section>
          <h2 className={styles.sectionTitle}>
            {active.length > 0 ? `Ativas (${active.length})` : 'Nenhuma quest ativa'}
          </h2>
          {active.length === 0 && (
            <p className={styles.empty}>Crie sua primeira quest para começar a jornada.</p>
          )}
          <div className={styles.questList}>
            {active.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                expanded={expandedId === q.id}
                onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
                onCompleteMission={(m) => completeMission(q, m)}
                onUncompleteMission={uncompleteMission}
                onCompleteQuest={() => completeQuestDirectly(q)}
                onAbandon={() => abandonQuest(q.id)}
              />
            ))}
          </div>
        </section>

        {/* concluídas */}
        {completed.length > 0 && (
          <section>
            <button
              className={styles.completedToggle}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <span className={styles.sectionTitle}>Concluídas ({completed.length})</span>
              <span>{showCompleted ? '▲' : '▼'}</span>
            </button>
            {showCompleted && (
              <div className={styles.questList}>
                {completed.map((q) => (
                  <QuestCard
                    key={q.id}
                    quest={q}
                    expanded={expandedId === q.id}
                    onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    onCompleteMission={() => {}}
                    onUncompleteMission={() => {}}
                    onCompleteQuest={() => {}}
                    onAbandon={() => {}}
                    readonly
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {showCreate && (
        <CreateModal
          pillars={pillars}
          userId={userId}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); reload(); }}
        />
      )}
    </div>
  );
}

// ─── QuestCard ────────────────────────────────────────────────

function QuestCard({
  quest, expanded, onToggle,
  onCompleteMission, onUncompleteMission, onCompleteQuest, onAbandon,
  readonly = false,
}: {
  quest: Quest;
  expanded: boolean;
  onToggle: () => void;
  onCompleteMission: (m: Mission) => void;
  onUncompleteMission: (id: string) => void;
  onCompleteQuest: () => void;
  onAbandon: () => void;
  readonly?: boolean;
}) {
  const total    = quest.missions.length;
  const done     = quest.missions.filter((m) => m.completed_at).length;
  const progress = total > 0 ? (done / total) * 100 : (quest.status === 'completed' ? 100 : 0);

  return (
    <div className={`${styles.card} ${quest.status === 'completed' ? styles.cardDone : ''}`}>
      <button className={styles.cardHeader} onClick={onToggle}>
        <div className={styles.cardTop}>
          <span
            className={styles.typeBadge}
            style={{ color: TYPE_COLORS[quest.type], backgroundColor: TYPE_COLORS[quest.type] + '22' }}
          >
            {TYPE_LABELS[quest.type]}
          </span>
          <span className={styles.xpBadge}>{quest.xp_reward} XP</span>
        </div>
        <h3 className={styles.cardTitle}>{quest.title}</h3>
        <p className={styles.cardPillar}>{quest.pillar_name}</p>
        {total > 0 && (
          <div className={styles.progressRow}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressLabel}>{done}/{total}</span>
          </div>
        )}
        <div className={styles.cardFooter}>
          <span className={quest.status === 'completed' ? styles.badgeDone : styles.badgeStatus}>
            {quest.status === 'completed' ? '✓ Concluída'
              : quest.status === 'in_progress' ? 'Em andamento' : 'Aberta'}
          </span>
          <span className={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className={styles.missions}>
          {quest.description && <p className={styles.description}>{quest.description}</p>}
          {total > 0 ? quest.missions.map((m) => (
            <div key={m.id} className={styles.missionRow}>
              <button
                className={`${styles.checkbox} ${m.completed_at ? styles.checkboxDone : ''}`}
                onClick={() => !readonly && (m.completed_at ? onUncompleteMission(m.id) : onCompleteMission(m))}
                disabled={readonly}
              >
                {m.completed_at && '✓'}
              </button>
              <span className={`${styles.missionTitle} ${m.completed_at ? styles.missionDone : ''}`}>
                {m.title}
              </span>
              <span className={styles.missionXP}>{m.xp_reward} XP</span>
            </div>
          )) : quest.status !== 'completed' && !readonly ? (
            <button className={styles.completeBtn} onClick={onCompleteQuest}>
              Marcar como concluída
            </button>
          ) : null}
          {!readonly && quest.status !== 'completed' && (
            <button className={styles.abandonBtn} onClick={onAbandon}>Abandonar quest</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CreateModal ──────────────────────────────────────────────

type NewMission = { title: string; xp_reward: string };

function CreateModal({
  pillars, userId, onClose, onCreated,
}: {
  pillars: Pillar[];
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const supabase = createClient();
  const [title, setTitle]       = useState('');
  const [type, setType]         = useState<QuestType>('main');
  const [pillarId, setPillarId] = useState(pillars[0]?.id ?? '');
  const [xpReward, setXpReward] = useState('200');
  const [description, setDesc]  = useState('');
  const [missions, setMissions] = useState<NewMission[]>([{ title: '', xp_reward: '50' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  function addMission() {
    if (missions.length < 6) setMissions([...missions, { title: '', xp_reward: '50' }]);
  }

  function removeMission(i: number) {
    setMissions(missions.filter((_, idx) => idx !== i));
  }

  function updateMission(i: number, field: keyof NewMission, value: string) {
    setMissions(missions.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Título obrigatório'); return; }
    const xp = parseInt(xpReward, 10);
    if (isNaN(xp) || xp <= 0) { setError('XP deve ser maior que zero'); return; }
    if (xp > 10000) { setError('XP máximo por quest é 10.000'); return; }
    const invalidMission = missions.find((m) => m.title.trim() && parseInt(m.xp_reward, 10) > 10000);
    if (invalidMission) { setError('XP máximo por missão é 10.000'); return; }

    setSubmitting(true);
    setError('');
    try {
      const { data: quest, error: qErr } = await supabase
        .from('quests')
        .insert({
          user_id: userId, pillar_id: pillarId,
          title: title.trim(), description: description.trim() || null,
          type, xp_reward: xp,
        })
        .select('id').single();
      if (qErr) throw qErr;

      const valid = missions.filter((m) => m.title.trim());
      if (valid.length > 0) {
        await supabase.from('quest_missions').insert(
          valid.map((m, i) => ({
            quest_id: quest.id, title: m.title.trim(),
            xp_reward: Math.max(1, parseInt(m.xp_reward, 10) || 50),
            sort_order: i,
          }))
        );
      }
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar quest');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nova Quest</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Título *</label>
            <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Aprender TypeScript avançado" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tipo</label>
            <div className={styles.chipRow}>
              {(['main', 'habit', 'learning', 'challenge'] as QuestType[]).map((t) => (
                <button
                  key={t} type="button"
                  className={`${styles.chip} ${type === t ? styles.chipActive : ''}`}
                  style={type === t ? { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t], backgroundColor: TYPE_COLORS[t] + '22' } : {}}
                  onClick={() => setType(t)}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Pilar</label>
            <div className={styles.chipRow}>
              {pillars.map((p) => (
                <button
                  key={p.id} type="button"
                  className={`${styles.chip} ${pillarId === p.id ? styles.chipActive : ''}`}
                  onClick={() => setPillarId(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Recompensa XP</label>
            <input className={styles.input} style={{ width: 100 }} value={xpReward} onChange={(e) => setXpReward(e.target.value)} type="number" min="1" max="10000" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descrição <span className={styles.optional}>(opcional)</span></label>
            <textarea className={styles.textarea} value={description} onChange={(e) => setDesc(e.target.value)} rows={2} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Missões <span className={styles.optional}>(opcional, máx. 6)</span></label>
            {missions.map((m, i) => (
              <div key={i} className={styles.missionInputRow}>
                <input
                  className={styles.input} style={{ flex: 1 }}
                  placeholder={`Missão ${i + 1}`}
                  value={m.title}
                  onChange={(e) => updateMission(i, 'title', e.target.value)}
                />
                <input
                  className={styles.input} style={{ width: 72 }}
                  type="number" min="1" max="10000"
                  value={m.xp_reward}
                  onChange={(e) => updateMission(i, 'xp_reward', e.target.value)}
                />
                {missions.length > 1 && (
                  <button type="button" className={styles.removeBtn} onClick={() => removeMission(i)}>✕</button>
                )}
              </div>
            ))}
            {missions.length < 6 && (
              <button type="button" className={styles.addMissionBtn} onClick={addMission}>
                + Adicionar missão
              </button>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar Quest'}
          </button>
        </form>
      </div>
    </div>
  );
}
