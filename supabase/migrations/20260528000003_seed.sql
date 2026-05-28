-- ============================================================
-- LifeGame — Seed: pillar_catalog
-- Taxas XP conforme PRD §2.
-- ============================================================

INSERT INTO public.pillar_catalog (id, name, xp_rate, focus, sort_order) VALUES
  ('mente',     'Mente',     1.8, 'Clareza, aprendizado e foco',                  1),
  ('proposito', 'Propósito', 1.6, 'Valores, legado e visão',                      2),
  ('trabalho',  'Trabalho',  1.4, 'Produção, metas e carreira',                   3),
  ('saude',     'Saúde',     1.2, 'Sono, exercício e energia',                    4),
  ('relacoes',  'Relações',  1.2, 'Família, amigos e amor',                       5),
  ('financas',  'Finanças',  1.0, 'Gastos, reserva e metas financeiras',          6),
  ('lazer',     'Lazer',     0.8, 'Hobbies e descanso',                           7);
