-- ============================================================
-- LifeGame — Schema inicial
-- ============================================================

-- ─── Enums ───────────────────────────────────────────────────

CREATE TYPE public.quest_type AS ENUM (
  'main',       -- objetivo grande e transformador
  'habit',      -- repetição que sobe um atributo
  'learning',   -- conclusão de curso, livro, skill
  'challenge'   -- algo com prazo definido
);

CREATE TYPE public.quest_status AS ENUM (
  'open',
  'in_progress',
  'completed',
  'abandoned'
);

CREATE TYPE public.event_type AS ENUM (
  'quest_milestone',  -- conclusão de quest ou sub-missão
  'context_event',    -- acontecimento sem quest prévia
  'state_change'      -- algo na vida mudou de patamar
);

CREATE TYPE public.context_anchor AS ENUM (
  'financial',              -- âncora: valor em R$
  'physical_achievement',   -- primeira maratona, etc. (XP fixo)
  'meaningful_connection'   -- conexão significativa (XP fixo)
);

CREATE TYPE public.activity_bonus AS ENUM (
  'forgotten_pillar',  -- pilar sem registro há 5+ dias → +50%
  'active_streak',     -- 7+ dias consecutivos no pilar → +30%
  'first_of_day',      -- primeiro registro do dia → +20%
  'active_quest'       -- ação vinculada a quest em andamento → +40%
);

-- ─── pillar_catalog ───────────────────────────────────────────
-- Referência somente leitura dos 7 pilares padrão.
-- Alimenta o onboarding; usuários copiam os escolhidos para user_pillars.

CREATE TABLE public.pillar_catalog (
  id         text    PRIMARY KEY,            -- slug: 'mente', 'saude', etc.
  name       text    NOT NULL,
  xp_rate    numeric(3,1) NOT NULL,
  focus      text    NOT NULL,               -- descrição curta do pilar
  sort_order smallint NOT NULL DEFAULT 0
);

-- ─── profiles ────────────────────────────────────────────────
-- Extensão de auth.users com dados do personagem.

CREATE TABLE public.profiles (
  id                      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    text        NOT NULL,
  onboarding_completed_at timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── user_pillars ─────────────────────────────────────────────
-- Pilares ativos de cada usuário (padrão + customizados).
-- xp_total e level são atualizados por trigger.

CREATE TABLE public.user_pillars (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  catalog_id     text        REFERENCES public.pillar_catalog(id),  -- NULL para pilares custom
  name           text        NOT NULL,
  xp_rate        numeric(3,1) NOT NULL CHECK (xp_rate > 0),
  is_active      boolean     NOT NULL DEFAULT true,
  is_priority    boolean     NOT NULL DEFAULT false,
  xp_total       integer     NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
  level          smallint    NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 50),
  baseline_score smallint    CHECK (baseline_score BETWEEN 1 AND 10),
  sort_order     smallint    NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Garante no máximo 1 instância de cada pilar padrão por usuário;
-- pilares custom (catalog_id IS NULL) não são restritos.
CREATE UNIQUE INDEX user_pillars_unique_catalog
  ON public.user_pillars (user_id, catalog_id)
  WHERE catalog_id IS NOT NULL;

-- ─── quests ──────────────────────────────────────────────────

CREATE TABLE public.quests (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pillar_id    uuid        NOT NULL REFERENCES public.user_pillars(id),
  title        text        NOT NULL,
  description  text,
  type         quest_type  NOT NULL,
  status       quest_status NOT NULL DEFAULT 'open',
  -- XP definido na criação — sem renegociação pós-conclusão (PRD §4)
  xp_reward    integer     NOT NULL CHECK (xp_reward > 0),
  target_date  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ─── quest_missions ───────────────────────────────────────────

CREATE TABLE public.quest_missions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id     uuid        NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  xp_reward    integer     NOT NULL CHECK (xp_reward > 0),
  sort_order   smallint    NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── xp_records ───────────────────────────────────────────────
-- Log imutável de todas as atividades registradas.
-- O usuário informa apenas duration_minutes; o restante é calculado no app.

CREATE TABLE public.xp_records (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pillar_id        uuid        NOT NULL REFERENCES public.user_pillars(id),
  quest_id         uuid        REFERENCES public.quests(id),
  duration_minutes smallint    NOT NULL CHECK (duration_minutes > 0),
  base_xp          integer     NOT NULL CHECK (base_xp > 0),
  bonus_multiplier numeric(4,2) NOT NULL DEFAULT 1.00 CHECK (bonus_multiplier BETWEEN 1.00 AND 2.50),
  total_xp         integer     NOT NULL CHECK (total_xp > 0),
  bonuses          activity_bonus[] NOT NULL DEFAULT '{}',
  note             text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── life_events ──────────────────────────────────────────────
-- Eventos sem duração: marcos de quest, eventos de contexto e mudanças de estado.

CREATE TABLE public.life_events (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pillar_id    uuid         NOT NULL REFERENCES public.user_pillars(id),
  quest_id     uuid         REFERENCES public.quests(id),
  mission_id   uuid         REFERENCES public.quest_missions(id),
  event_type   event_type   NOT NULL,
  anchor_type  context_anchor,
  anchor_value numeric,     -- R$, kg, km, delta financeiro, etc.
  description  text         NOT NULL,
  xp_awarded   integer      NOT NULL CHECK (xp_awarded >= 0),
  created_at   timestamptz  NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────

CREATE INDEX user_pillars_user_id_idx   ON public.user_pillars (user_id);
CREATE INDEX quests_user_status_idx     ON public.quests (user_id, status);
CREATE INDEX quest_missions_quest_idx   ON public.quest_missions (quest_id);

-- Consultas de detecção de bônus (streak, primeiro do dia, pilar esquecido)
CREATE INDEX xp_records_user_time_idx   ON public.xp_records (user_id, created_at DESC);
CREATE INDEX xp_records_pillar_time_idx ON public.xp_records (pillar_id, created_at DESC);

CREATE INDEX life_events_user_time_idx  ON public.life_events (user_id, created_at DESC);
