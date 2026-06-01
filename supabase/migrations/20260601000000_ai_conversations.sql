-- ============================================================
-- Anima — Histórico de conversas com IA
-- ============================================================

CREATE TABLE public.ai_conversations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       text        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_conversations_user_time_idx ON public.ai_conversations (user_id, created_at DESC);

-- RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê só suas mensagens"
  ON public.ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere só suas mensagens"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário deleta só suas mensagens"
  ON public.ai_conversations FOR DELETE
  USING (auth.uid() = user_id);
