-- ============================================================
-- Anima — Sistema de sub-pilares hierárquico
-- ============================================================

-- ─── Tabela de relações pai → filho ──────────────────────────
CREATE TABLE public.pillar_relationships (
  parent_id  uuid NOT NULL REFERENCES public.user_pillars(id) ON DELETE CASCADE,
  child_id   uuid NOT NULL REFERENCES public.user_pillars(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, child_id),
  -- Evita self-reference
  CONSTRAINT no_self_reference CHECK (parent_id <> child_id)
);

CREATE INDEX pillar_rel_child_idx  ON public.pillar_relationships (child_id);
CREATE INDEX pillar_rel_parent_idx ON public.pillar_relationships (parent_id);

-- RLS
ALTER TABLE public.pillar_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia suas próprias relações"
  ON public.pillar_relationships
  USING (
    EXISTS (
      SELECT 1 FROM public.user_pillars up
      WHERE up.id = pillar_relationships.parent_id
        AND up.user_id = auth.uid()
    )
  );

-- ─── Trigger de XP com propagação recursiva ──────────────────
-- Quando um xp_record é inserido, atualiza o pilar direto
-- e propaga 100% do XP para todos os ancestrais.

CREATE OR REPLACE FUNCTION public.trigger_xp_record_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualiza o pilar direto do registro
  UPDATE public.user_pillars
  SET
    xp_total   = xp_total + NEW.total_xp,
    level      = public.lifegame_get_level_from_xp(xp_total + NEW.total_xp),
    updated_at = now()
  WHERE id = NEW.pillar_id;

  -- Propaga 100% do XP para todos os ancestrais (recursivo)
  WITH RECURSIVE ancestors AS (
    SELECT parent_id AS id
    FROM public.pillar_relationships
    WHERE child_id = NEW.pillar_id

    UNION ALL

    SELECT pr.parent_id
    FROM public.pillar_relationships pr
    INNER JOIN ancestors a ON pr.child_id = a.id
  )
  UPDATE public.user_pillars
  SET
    xp_total   = xp_total + NEW.total_xp,
    level      = public.lifegame_get_level_from_xp(xp_total + NEW.total_xp),
    updated_at = now()
  WHERE id IN (SELECT id FROM ancestors);

  RETURN NEW;
END;
$$;

-- ─── Trigger de life_event com propagação recursiva ──────────

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

  WITH RECURSIVE ancestors AS (
    SELECT parent_id AS id
    FROM public.pillar_relationships
    WHERE child_id = NEW.pillar_id

    UNION ALL

    SELECT pr.parent_id
    FROM public.pillar_relationships pr
    INNER JOIN ancestors a ON pr.child_id = a.id
  )
  UPDATE public.user_pillars
  SET
    xp_total   = xp_total + NEW.xp_awarded,
    level      = public.lifegame_get_level_from_xp(xp_total + NEW.xp_awarded),
    updated_at = now()
  WHERE id IN (SELECT id FROM ancestors);

  RETURN NEW;
END;
$$;

-- ─── View: character_stats exclui sub-pilares ────────────────
-- Sub-pilares já propagam XP para os pais — incluí-los na
-- média de nível causaria dupla contagem.

CREATE OR REPLACE VIEW public.character_stats AS
SELECT
  p.user_id,
  ROUND(AVG(p.level))::smallint                         AS character_level,
  SUM(p.xp_total)                                       AS total_xp_all_pillars,
  COUNT(*) FILTER (WHERE p.is_active)                   AS active_pillar_count,
  json_agg(
    json_build_object(
      'id',          p.id,
      'name',        p.name,
      'xp_rate',     p.xp_rate,
      'xp_total',    p.xp_total,
      'level',       p.level,
      'is_active',   p.is_active,
      'is_priority', p.is_priority
    ) ORDER BY p.sort_order
  ) AS pillars
FROM public.user_pillars p
WHERE
  p.is_active = true
  -- Exclui sub-pilares (pilares que têm pelo menos um pai)
  AND NOT EXISTS (
    SELECT 1 FROM public.pillar_relationships pr WHERE pr.child_id = p.id
  )
GROUP BY p.user_id;
