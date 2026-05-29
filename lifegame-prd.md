# LifeGame — Product Requirements Document
> Documento vivo de design. Última atualização: 2026-05-28
> Para retomar o projeto em qualquer IA: cole este documento e diga "quero continuar desenvolvendo o LifeGame a partir deste PRD."

---

## 1. Visão geral

**Nome provisório:** LifeGame  
**Plataformas:** Desktop, Web, Mobile (todas)  
**Estágio atual:** Em desenvolvimento ativo — auth, onboarding, registro de atividades e histórico implementados na web  
**Repositório:** https://github.com/GeanPfefer/lifegame  
**Público inicial:** O próprio criador (uso pessoal para validar o sistema)  
**Público futuro:** Aberto ao público após o sistema estar bem estruturado e funcional

### Conceito central
Um organizador de vida inspirado em videogames. O usuário é o personagem, a vida é o mapa, e o app é o HUD — painel de status sempre visível. Assim como nos games, o usuário decide o que fazer e quando fazer. O app não obriga nada: mostra o estado atual da vida em todos os pilares, sugere ações disponíveis, e registra a evolução ao longo do tempo.

**Diferencial principal:** Não é mais um app de tarefas. É um espelho da vida — com progressão de personagem, quests, XP e níveis — que conecta diferentes áreas da vida e detecta padrões entre elas.

---

## 2. Pilares de vida

O usuário escolhe quais pilares acompanhar durante o onboarding. Os pilares padrão são:

| Pilar | Foco | Taxa XP/min |
|-------|------|-------------|
| Mente | clareza, aprendizado, foco | 1,8 |
| Propósito | valores, legado, visão | 1,6 |
| Trabalho | produção, metas, carreira | 1,4 |
| Saúde | sono, exercício, energia | 1,2 |
| Relações | família, amigos, amor | 1,2 |
| Finanças | gastos, reserva, metas | 1,0 |
| Lazer | hobbies, descanso | 0,8 |

**Regras dos pilares:**
- O usuário pode remover pilares padrão (mínimo 3 ativos)
- O usuário pode adicionar pilares personalizados (ex: Espiritualidade, Criatividade, Aventura)
- Pilares são definidos no onboarding e podem ser editados depois
- Cada pilar tem seu próprio nível (1–50)
- O nível geral do personagem é a média dos níveis de todos os pilares ativos

**Conexões entre pilares:**
- Saúde impacta fortemente Mente e Trabalho (detectável em 1–2 dias)
- Saúde impacta medianamente Relações e Lazer
- Saúde impacta fracamente Finanças e Propósito
- Mente e Saúde são bidirecionais (estresse afeta saúde; saúde afeta clareza mental)
- O app detecta e exibe esses padrões como insights automáticos

---

## 3. Sistema de XP

### Filosofia
- Tempo é a única âncora objetiva — não tem como inflar
- O usuário informa apenas o tempo investido; o resto é calculado automaticamente
- Consistência é sempre recompensada, nunca punida
- Todos os usuários usam as mesmas regras (equidade quando abrir ao público)

### Fórmula base
```
XP = tempo (min) × taxa do pilar × multiplicador de bônus
```

### Bônus automáticos (sem input do usuário)
| Bônus | Multiplicador | Condição |
|-------|--------------|----------|
| Pilar esquecido | +50% | Pilar sem registro há 5+ dias |
| Sequência ativa | +30% | 7+ dias consecutivos no mesmo pilar |
| Primeiro do dia | +20% | Primeiro registro do dia em qualquer pilar |
| Quest ativa | +40% | Ação vinculada a uma quest em andamento |

**Teto de bônus:** ×2,5 total (evita distorções extremas)

### Implementação dos bônus (decisão técnica)
- Bônus são detectados automaticamente no servidor no momento do registro
- `primeiro_do_dia`: consulta `xp_records` do dia atual (qualquer pilar)
- `pilar_esquecido`: consulta `xp_records` dos últimos 5 dias para o pilar
- `sequencia_ativa`: consulta `xp_records` dos 6 dias anteriores; se todos têm registro, aplica bônus (7º dia consecutivo)
- Bônus são recalculados no save — não apenas no preview — para evitar race conditions

### O que foi REMOVIDO
- ~~Dificuldade percebida (1–3)~~ — subjetivo demais
- ~~Frequência punindo XP~~ — desmotivador. Consistência só recompensa.

---

## 4. Sistema de eventos

Eventos são ações sem duração — um momento, não uma atividade. Existem 3 tipos:

### Tipo 1 — Marco de quest
- Conclusão de uma quest ou sub-missão definida previamente
- XP é definido pelo usuário **no momento da criação da quest** (antes de começar)
- Sem renegociação após conclusão
- Faixas sugeridas: pequena 50–150 XP / média 200–400 XP / grande 500–1000 XP

### Tipo 2 — Evento de contexto
- Acontecimento sem quest prévia
- XP calculado por âncoras verificáveis:
  - Valor financeiro: XP = valor em R$ ÷ 10 (ex: guardar R$500 = 50 XP)
  - Conquista física inédita (primeira maratona, etc): XP fixo por categoria (~300 XP)
  - Conexão significativa (sim/não binário): XP fixo (~80 XP)

### Tipo 3 — Mudança de estado
- Algo na vida mudou de patamar permanentemente
- XP calculado pelo **delta** (diferença entre estado anterior e novo):
  - Financeiro: delta em R$ (quitou R$5k de dívida = 500 XP)
  - Saúde: delta em métrica verificável (perdeu 5kg em 3 meses = XP proporcional)
  - Trabalho/Propósito: mudança de cargo, área ou renda
  - Relações/Mente: estados binários com XP fixo por categoria

### Por que é difícil trapacear
- Tempo não escala infinito (realidade limita)
- Âncoras numéricas existem fora do app (R$, kg, km)
- Perguntas binárias (sim/não) em vez de escalas
- O usuário é o único juiz — trapacear só prejudica o próprio espelho

---

## 5. Sistema de níveis e eras

### Estrutura
- 50 níveis totais por pilar
- Nível geral do personagem = média dos níveis de todos os pilares ativos
- Curva exponencial: começo rápido, meio desafiador, topo quase inalcançável
- Fórmula: `XP para nível L = ROUND(10 × 1,6^(L-1))` — espelhada no banco via função SQL

### As 5 eras

| Era | Níveis | Nome | XP total aprox. | Tempo estimado* |
|-----|--------|------|----------------|-----------------|
| 1 | 1–10 | Despertar | ~300 XP | ~2 semanas |
| 2 | 11–20 | Construção | ~2.800 XP | ~3 meses |
| 3 | 21–35 | Expansão | ~18.000 XP | ~1,5 anos |
| 4 | 36–45 | Maestria | ~55.000 XP | ~5 anos |
| 5 | 46–50 | Lenda | ~100.000 XP | ~10 anos |

*Assumindo ~60 XP/dia de uso ativo (45 min registrados com bônus ocasionais)

### Funcionalidades desbloqueadas por era

**Despertar (1–10):** pilares básicos, check-in diário, radar de vida, quests simples  
**Construção (11–20):** histórico de evolução, conexões entre pilares, quests com sub-missões, insights automáticos  
**Expansão (21–35):** análise de padrões mensais, comparativo de períodos, quests de longo prazo, pilares customizáveis  
**Maestria (36–45):** relatório anual de vida, predição de tendências, modo foco com IA, exportação de dados  
**Lenda (46–50):** perfil público (quando abrir ao público), mentoria de quests, acesso antecipado a features  

---

## 6. Quests

Quests são objetivos do usuário traduzidos em missões com estrutura de game.

### Tipos de quest
- **Quest principal:** objetivo grande e transformador (ex: trocar de área profissional)
- **Hábito:** repetição que sobe um atributo (ex: dormir 7h por 30 dias)
- **Aprendizado:** conclusão de curso, livro, skill
- **Desafio pontual:** algo com prazo definido

### Estrutura de uma quest
- Pertence a um pilar
- Pode ter sub-missões
- XP total definido na criação (para marcos/conclusão)
- Ações de atividade dentro da quest ganham XP pela fórmula de tempo
- Status: aberta / em andamento / concluída / abandonada

### Sugestão contextual
O app sugere quests e ações disponíveis com base em:
- Estado atual dos pilares (qual está negligenciado)
- Check-in do dia (como o usuário está)
- Quests em andamento
- Hora do dia e histórico de hábitos

---

## 7. Onboarding (primeiro login)

**3 etapas** (etapas 3 e 4 do design original foram removidas — ver decisões de design).

### Etapa 1 — Você
- Campo: nome (como quer ser chamado)

### Etapa 2 — Pilares
- Apresenta os 7 pilares padrão pré-selecionados
- Usuário pode desmarcar (mínimo 3)
- Usuário pode adicionar pilares personalizados

### Etapa 3 — Personagem *(era etapa 5)*
- Exibe o personagem criado: nome, Nível 1, Era: Despertar
- Lista os pilares ativos com a taxa de XP de cada um
- CTA: "Começar a jornada"
- Ao confirmar: salva `name` e `onboarding_completed_at` no perfil, insere pilares em `user_pillars`

### O que foi REMOVIDO do onboarding original
- ~~Etapa 3 — Sliders de baseline (1–10)~~ — diagnóstico visual sem impacto no sistema; removido por adicionar fricção sem valor
- ~~Etapa 4 — Seleção de prioridades~~ — afetava apenas sugestões de quest (ainda não implementadas); removido para simplificar o fluxo inicial

---

## 8. Fluxo de autenticação

### Rotas
| Rota | Comportamento |
|------|--------------|
| `/` | Roteador inteligente: sem sessão → `/login`; com sessão + onboarding feito → `/home`; com sessão sem onboarding → `/step-1` |
| `/login` | Server Action via Supabase Auth; sucesso → `/home` |
| `/signup` | Server Action via Supabase Auth; sucesso → `/step-1` |
| `/forgot-password` | Envia e-mail de reset via `supabase.auth.resetPasswordForEmail`; em dev, e-mail chega no Mailpit (porta 54324) |
| `/auth/callback` | Route Handler que troca o `code` por sessão (PKCE); redireciona para `?next=` |
| `/reset-password` | Define nova senha via `supabase.auth.updateUser`; redireciona para `/home` |
| `/settings` | Exibe dados da conta e formulário de troca de senha |
| `/history` | Timeline de atividades registradas agrupada por dia |
| `/step-1` a `/step-3` | Protegidas por auth guard no layout do grupo `(onboarding)` |
| `/home` | Protegida por auth guard no layout do grupo `(app)` |

### Decisões técnicas de auth
- Auth via `@supabase/ssr` com cookies — necessário para Server Components lerem a sessão
- Server Actions para login/signup — garante que o cookie é setado antes do redirect
- Layouts assíncronos como auth guards — padrão Next.js App Router
- `resetPasswordForEmail` chamado do cliente browser (PKCE requer código de verificação armazenado em cookie)
- `server.ts` usa try/catch no `setAll` de cookies — Server Components não podem escrever cookies, mas a leitura da sessão funciona normalmente
- Cliente browser usa `createBrowserClient` do `@supabase/ssr` (não o vanilla `createClient`) para ler sessão dos cookies em sincronia com o servidor

---

## 9. Banco de dados

### Tabelas principais

| Tabela | Função |
|--------|--------|
| `profiles` | Dados do usuário (nome, onboarding_completed_at) |
| `pillar_catalog` | Catálogo dos 7 pilares padrão com taxas XP |
| `user_pillars` | Pilares ativos por usuário (xp_total, level, is_active) |
| `xp_records` | Histórico imutável de atividades registradas |
| `life_events` | Eventos sem duração (marcos, conquistas, mudanças de estado) |
| `quests` | Quests do usuário |
| `quest_missions` | Sub-missões de uma quest |

### Triggers automáticos
- `on_auth_user_created` → cria row em `profiles` automaticamente no signup
- `on_xp_record_insert` → atualiza `xp_total` e `level` em `user_pillars` ao inserir atividade
- `on_life_event_insert` → mesmo comportamento para eventos de vida
- `on_mission_completed` → auto-completa a quest quando todas as missões estão concluídas

### View
- `character_stats` → agrega nível e XP de todos os pilares ativos por usuário

### Acesso local (desenvolvimento)
- Studio visual: `http://127.0.0.1:54323`
- URL PostgreSQL direta: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Subir: `npx supabase start` (dentro de `~/lifegame`)
- Resetar dados: `npx supabase db reset`

---

## 10. Decisões de design registradas

| Decisão | Escolha feita | Motivo |
|---------|--------------|--------|
| Nível do personagem | Média dos níveis dos pilares | Representa a vida completa, não uma área só |
| Âncora de XP | Tempo (único input do usuário) | Objetivo, não inflável |
| Dificuldade percebida | Removida | Subjetiva demais |
| Frequência punindo XP | Removida | Desmotivador |
| Nível inicial pelo onboarding | Removido | XP deve ser ganho, não declarado |
| Stack técnica | React Native + Expo + Next.js + Supabase + TypeScript | Multiplataforma real, compartilhamento de lógica, início rápido sem infra |
| Pilares | Customizáveis por usuário | Cada vida é diferente |
| XP de quests | Definido antes de começar | Remove viés de inflação pós-conclusão |
| Etapas 3 e 4 do onboarding | Removidas | Baseline sem impacto no sistema; prioridades sem quests implementadas — fricção desnecessária no fluxo inicial |
| Auth via Server Actions | Escolhido sobre client-side | Cookie setado server-side é necessário para SSR ler a sessão |
| `xp_records` imutável | Update bloqueado por design no schema | Histórico de XP não pode ser editado — integridade do sistema |
| Bônus recalculados no save | Não confia no preview do cliente | Evita race condition se outro registro acontece entre preview e submit |
| Cliente browser usa `createBrowserClient` | Em vez do vanilla `createClient` do supabase-js | Sessão gravada em cookies pelo servidor; vanilla lia do localStorage e não encontrava o usuário |
| `setAll` de cookies em try/catch no server.ts | Ignora erro silenciosamente em Server Components | Next.js só permite escrever cookies em Server Actions e Route Handlers; a leitura da sessão funciona normalmente |

---

## 11. Stack técnica

### Frontend
| Camada | Tecnologia |
|--------|-----------|
| Mobile (iOS + Android) | React Native + Expo 56 |
| Web + Desktop | Next.js 15 (App Router) |
| Linguagem | TypeScript strict |
| Estilo (web) | CSS Modules com variáveis de tema escuro |

### Backend
| Camada | Tecnologia |
|--------|-----------|
| Server Actions | Next.js (`'use server'`) |
| Banco de dados | PostgreSQL via Supabase |
| Auth | Supabase Auth + `@supabase/ssr` |
| Realtime | Supabase Realtime (futuro) |

### Estrutura de repositório
```
lifegame/
├── apps/
│   ├── mobile/                    # React Native + Expo
│   └── web/
│       ├── app/
│       │   ├── (app)/home/        # Dashboard + registro de atividades
│       │   ├── (onboarding)/      # Steps 1–3 com auth guard
│       │   ├── login/             # Página de login
│       │   ├── signup/            # Página de cadastro
│       │   └── page.tsx           # Roteador raiz inteligente
│       └── lib/supabase/          # Clientes SSR e browser
├── packages/
│   ├── core/                      # Lógica de XP, níveis, quests, onboarding
│   └── types/                     # TypeScript types + tipos do banco
└── supabase/
    └── migrations/                # Schema, funções, triggers, RLS, seed
```

---

## 12. O que está implementado (web)

- [x] Schema completo do banco com triggers e RLS
- [x] Autenticação — login, signup, logout implícito por sessão
- [x] Recuperação de senha — forgot-password → e-mail (Mailpit em dev) → reset-password
- [x] Roteamento inteligente na raiz (`/`)
- [x] Onboarding em 3 etapas (nome → pilares → confirmação)
- [x] Dashboard home — radar de vida SVG, cards de pilares com barra de XP
- [x] Registro de atividades — modal com seleção de pilar, tempo, preview de XP ao vivo, bônus automáticos
- [x] Histórico de atividades — timeline agrupada por dia, total de XP diário e semanal, badges de bônus
- [x] Configurações — página com dados da conta e formulário de troca de senha
- [x] Nav compartilhada — barra top fixa (AppNav) com Home, Histórico e Configurações em todas as telas autenticadas

---

## 13. Próximos temas a explorar

- [ ] Fluxo de criação de uma quest
- [ ] Check-in diário (experiência de 30 segundos)
- [ ] Sistema de insights automáticos entre pilares
- [ ] App mobile (Expo) — replicar auth e dashboard
- [ ] Modelo de monetização (quando abrir ao público)
- [ ] Integrações externas (Apple Health, Google Fit, calendário)

---

## 14. Como usar este documento

**Para continuar em outra sessão de IA:**
1. Cole este documento inteiro no início da conversa
2. Diga: *"Quero continuar desenvolvendo o LifeGame a partir deste PRD. [Próximo tema]"*
3. A IA terá todo o contexto das decisões já tomadas

**Para atualizar após novas decisões:**
- Adicione à seção "Decisões de design registradas"
- Atualize a seção relevante com o novo conceito
- Mova itens da lista "Próximos temas" para "O que está implementado" quando concluídos
