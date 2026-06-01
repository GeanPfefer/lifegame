-- Contexto pessoal de cada pilar (respostas do questionário de onboarding)
ALTER TABLE public.user_pillars ADD COLUMN context jsonb;
