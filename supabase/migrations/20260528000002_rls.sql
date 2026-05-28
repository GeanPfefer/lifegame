-- ============================================================
-- LifeGame — Row Level Security
-- Regra geral: cada usuário só acessa e altera seus próprios dados.
-- xp_records e life_events são imutáveis (sem UPDATE nem DELETE).
-- ============================================================

-- ─── pillar_catalog (leitura pública, sem escrita por usuários) ─

ALTER TABLE public.pillar_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pillar_catalog: leitura pública"
  ON public.pillar_catalog FOR SELECT
  USING (true);

-- ─── profiles ─────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: leitura própria"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: atualização própria"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── user_pillars ─────────────────────────────────────────────

ALTER TABLE public.user_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_pillars: leitura própria"
  ON public.user_pillars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_pillars: inserção própria"
  ON public.user_pillars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_pillars: atualização própria"
  ON public.user_pillars FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── quests ───────────────────────────────────────────────────

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quests: leitura própria"
  ON public.quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quests: inserção própria"
  ON public.quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quests: atualização própria"
  ON public.quests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── quest_missions ───────────────────────────────────────────

ALTER TABLE public.quest_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quest_missions: leitura via quest própria"
  ON public.quest_missions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_missions.quest_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "quest_missions: inserção via quest própria"
  ON public.quest_missions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_missions.quest_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "quest_missions: atualização via quest própria"
  ON public.quest_missions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = quest_missions.quest_id
        AND q.user_id = auth.uid()
    )
  );

-- ─── xp_records (imutável — sem UPDATE ou DELETE) ─────────────

ALTER TABLE public.xp_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_records: leitura própria"
  ON public.xp_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "xp_records: inserção própria"
  ON public.xp_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── life_events (imutável — sem UPDATE ou DELETE) ────────────

ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_events: leitura própria"
  ON public.life_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "life_events: inserção própria"
  ON public.life_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── character_stats view ─────────────────────────────────────

ALTER VIEW public.character_stats SET (security_invoker = true);
