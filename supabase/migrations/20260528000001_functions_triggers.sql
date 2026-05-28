-- ============================================================
-- LifeGame — Funções e Triggers
-- ============================================================

-- ─── Utilitário: updated_at automático ───────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_pillars_updated_at
  BEFORE UPDATE ON public.user_pillars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_quests_updated_at
  BEFORE UPDATE ON public.quests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Perfil automático no signup ─────────────────────────────
-- Cria um profiles row quando um novo usuário é criado no Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Jogador')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Cálculo de nível a partir do XP total ───────────────────
-- Espelha exatamente a lógica de packages/core/src/levels.ts:
--   getXPForLevel(l) = ROUND(10 * 1.6^(l-1))
--   Nível sobe quando xp_total >= soma acumulada dos thresholds.

CREATE OR REPLACE FUNCTION public.lifegame_get_level_from_xp(p_total_xp integer)
RETURNS smallint
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_level       smallint := 1;
  v_accumulated integer  := 0;
BEGIN
  FOR v_l IN 2..50 LOOP
    v_accumulated := v_accumulated + ROUND(10 * POWER(1.6, v_l - 1))::integer;
    EXIT WHEN v_accumulated > p_total_xp;
    v_level := v_l;
  END LOOP;
  RETURN v_level;
END;
$$;

-- ─── Trigger: atualiza pilar ao registrar atividade ──────────
-- Incrementa xp_total e recalcula level no user_pillars
-- quando um xp_record é inserido.

CREATE OR REPLACE FUNCTION public.trigger_xp_record_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_pillars
  SET
    xp_total   = xp_total + NEW.total_xp,
    level      = public.lifegame_get_level_from_xp(xp_total + NEW.total_xp),
    updated_at = now()
  WHERE id = NEW.pillar_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_xp_record_insert
  AFTER INSERT ON public.xp_records
  FOR EACH ROW EXECUTE FUNCTION public.trigger_xp_record_insert();

-- ─── Trigger: atualiza pilar ao registrar evento de vida ─────

CREATE OR REPLACE FUNCTION public.trigger_life_event_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.user_pillars
  SET
    xp_total   = xp_total + NEW.xp_awarded,
    level      = public.lifegame_get_level_from_xp(xp_total + NEW.xp_awarded),
    updated_at = now()
  WHERE id = NEW.pillar_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_life_event_insert
  AFTER INSERT ON public.life_events
  FOR EACH ROW EXECUTE FUNCTION public.trigger_life_event_insert();

-- ─── Trigger: auto-completa quest quando todas as missões ────
-- Quando uma quest_mission é concluída, verifica se todas as missões
-- da quest estão completas e, se sim, atualiza o status da quest.

CREATE OR REPLACE FUNCTION public.trigger_check_quest_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total     integer;
  v_completed integer;
BEGIN
  IF NEW.completed_at IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT
    COUNT(*),
    COUNT(completed_at)
  INTO v_total, v_completed
  FROM public.quest_missions
  WHERE quest_id = NEW.quest_id;

  IF v_total > 0 AND v_total = v_completed THEN
    UPDATE public.quests
    SET
      status       = 'completed',
      completed_at = now(),
      updated_at   = now()
    WHERE id = NEW.quest_id
      AND status != 'completed';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_mission_completed
  AFTER UPDATE OF completed_at ON public.quest_missions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_quest_completion();

-- ─── View: progresso do personagem ───────────────────────────
-- Agrega nível e XP de todos os pilares ativos para calcular o
-- nível geral (média aritmética dos níveis dos pilares ativos).

CREATE OR REPLACE VIEW public.character_stats AS
SELECT
  p.user_id,
  ROUND(AVG(p.level))::smallint                         AS character_level,
  SUM(p.xp_total)                                       AS total_xp_all_pillars,
  COUNT(*) FILTER (WHERE p.is_active)                   AS active_pillar_count,
  json_agg(
    json_build_object(
      'id',         p.id,
      'name',       p.name,
      'xp_rate',    p.xp_rate,
      'xp_total',   p.xp_total,
      'level',      p.level,
      'is_active',  p.is_active,
      'is_priority',p.is_priority
    ) ORDER BY p.sort_order
  )                                                     AS pillars
FROM public.user_pillars p
WHERE p.is_active = true
GROUP BY p.user_id;
