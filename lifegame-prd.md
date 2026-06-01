# Anima — Product Requirements Document
> Documento vivo de design. Última atualização: 2026-06-01 (sessão: IA local Ollama · sistema de arquétipos · sub-pilares hierárquicos · onboarding 5 etapas · contexto de pilares)
> Para retomar o projeto em qualquer IA: cole este documento e diga "quero continuar desenvolvendo o Anima a partir deste PRD."

---

## 1. Visão geral

**Nome provisório:** Anima  
**Plataformas:** Desktop, Web, Mobile (todas)  
**Estágio atual:** Em desenvolvimento ativo — auth, onboarding, registro de atividades, histórico e quests implementados em web e mobile  
**Repositório:** https://github.com/GeanPfefer/lifegame  
**Público inicial:** O próprio criador (uso pessoal para validar o sistema)  
**Público futuro:** Aberto ao público após o sistema estar bem estruturado e funcional

### Conceito central
Um organizador de vida inspirado em videogames. O usuário é o personagem, a vida é o mapa, e o app é o HUD — painel de status sempre visível. Assim como nos games, o usuário decide o que fazer e quando fazer. O app não obriga nada: mostra o estado atual da vida em todos os pilares, sugere ações disponíveis, e registra a evolução ao longo do tempo.

**Diferencial principal:** Não é mais um app de tarefas. É um espelho da vida — com progressão de personagem, quests, XP e níveis — que conecta diferentes áreas da vida e detecta padrões entre elas.

**A lente do produto (definida em jun/2026):** na prática, o Anima se comporta como uma **agenda + diário** organizada por pilares, com a camada de game (XP, níveis, eras, quests) por cima. A interação principal é *escrever* o que aconteceu ou se planeja — não preencher formulários. Insight central: logar dados é fricção que as pessoas abandonam; escrever um diário é algo que a pessoa já quer fazer. Quando o ato de organizar a vida *é* a interação, o input deixa de ser custo e vira o próprio valor.

**Standalone primeiro, integrações depois:** o app é 100% autossuficiente. Qualquer integração externa (Obsidian, Apple Health, etc.) só *adiciona* — nunca é dependência. Ver seção 13b.

---

## 1b. Modelo de interação e cadência

> Definido na sessão de design de jun/2026. Mistura princípios já **decididos** com **hipóteses em teste** no protótipo.

### Princípio organizador
A frequência de input deve **espelhar a velocidade com que cada coisa muda**. Não se pergunta tudo na mesma cadência:

| O que | Velocidade de mudança | Como é capturado |
|-------|----------------------|------------------|
| Identidade, pilares | Raríssima | Onboarding + edição esporádica |
| Humor / energia / o dia | Diária | Pulso/entrada do dia (quando der) |
| Atividades | Ao longo do dia | Registro oportunista |
| Eventos de vida, mudanças de estado | Rara | Orientado a evento |
| Sono, passos, treino (futuro) | Contínua | Passivo via integração |

### Camadas de input (do mais frequente ao mais raro)
- **Camada 1 — Pulso/entrada do dia:** momento leve, "quando der". **Não** é streak obrigatório.
- **Camada 2 — Registro/entrada (oportunista):** escreve quando quer; opcionalmente com tempo (gera XP). Nunca obrigatório.
- **Camada 3 — Eventos e marcos (raro):** o app não pergunta; o usuário busca quando algo notável acontece. No máximo o app reage.
- **Camada 0 — Passivo (futuro):** integrações puxam dados sozinhas. As camadas 1–3 funcionam plenas mesmo sem ela.

### Princípio: acolhedor com a ausência (decisão de design)
O criador (primeiro usuário) costuma passar **dias sem mexer no celular**. Isso elimina qualquer mecânica de streak punitiva:
- Sem sequência diária "a perder". A ausência nunca é punida.
- Voltar depois de dias fora é **acolhido**, não cobrado ("faz X dias, sem pressa, conta o que rolou").
- O bônus de **pilar esquecido (+50%)** é reposicionado como um *bem-vindo de volta*, não penalidade.
- Mantém a regra do PRD: consistência recompensa, nunca pune.

### Decisões tomadas (jun/2026)
- **Entrada unificada:** ✅ decidido. Diário e registro de atividade são **um único objeto** ("entrada"). Uma entrada tem: data, pilar(es), tempo opcional (gera XP pela fórmula), texto livre, links. O radar/níveis são derivados das entradas. Objetos distintos descartados — podemos revisar no futuro se o uso pedir.
- **Entrada sem tempo:** ✅ decidido. Permitida, gera 0 XP, conta como presença.
- **Backfill com data passada:** ✅ decidido. Registrar com data anterior é permitido; bônus calculados relativos à data informada, não à data do submit.

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
| Lente do produto | Agenda + diário por pilares, com game por cima | Escrever é algo que a pessoa já quer fazer; logar é fricção que se abandona — input vira valor |
| Acolhimento da ausência | App nunca pune ausência; voltar depois de dias é acolhido | Criador passa dias sem o celular; streak punitivo faria largar o app |
| Streak punitivo | Nunca existirá | Mesma razão; consistência só recompensa |
| Cadência de input | Espelha a velocidade de mudança de cada coisa | Evita pedir tudo na mesma frequência; reduz fricção |
| Obsidian | Integração aditiva (opção híbrida): app fala markdown, não depende do Obsidian | Funciona standalone e integrado; "só adiciona, nunca atrapalha" |
| IA local (Ollama) | Modelos open-source rodando na máquina do usuário (Goma) via API HTTP | Privacidade total, custo zero, sem dependência de terceiros; qualidade inferior ao GPT-4 mas aceitável para uso pessoal |
| Arquitetura IA | Notebook → API Next.js → Ollama na Goma (100.68.239.78:11434) | Separação de responsabilidades: notebook para dev, Goma para inferência pesada |
| Modelo padrão | qwen2.5:14b (general purpose, não coder) | Respostas mais naturais para contexto pessoal vs. coder que é técnico/seco |
| Sistema de arquétipos | 4 arquétipos (Explorador, Focado, Construtor, Visionário) com % combinados por pessoa | Personalidade não é binária; combinação única captura melhor quem a pessoa é |
| Arquétipo no onboarding | Quiz de 5 perguntas com chips antes da seleção de pilares | Contexto de personalidade molda como a IA orienta desde o primeiro dia |
| Sub-pilares | Hierarquia infinita com múltiplos pais; XP propaga 100% para todos os ancestrais | Tudo na vida é correlacionado — 1h de Skate melhora Saúde E Lazer de verdade, não 50% de cada |
| Sub-pilares excluídos do nível | character_stats só conta pilares raiz (sem pais) | Sub-pilares já propagam XP para pais — incluí-los causaria dupla contagem no nível do personagem |
| Contexto de pilar | Perguntas com chips multiselect + "Outro" (texto livre); salvo como JSONB | Cada pilar tem intenções diferentes; contexto rico melhora orientação da IA |
| "Outro" em perguntas | Última opção sempre abre input inline; confirma com Enter | Padrão de UX igual ao Claude (AskUserQuestion) — familiar e fluido |
| XP de quests limitado | Máx 10.000 XP por quest e por missão | Evita distorções extremas no sistema de progressão |
| Padrão de adaptador p/ integrações | Núcleo agnóstico + conector plugável na borda | Mesmo encaixe serve depois para Health/Fit; não acopla o app a ferramenta externa |
| Sync Obsidian inicial | Só export, mão única (Postgres → markdown) | Duas vias (conflito/parsing) poderia quebrar e "atrapalhar"; fica para fase 2 |

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
│       │   ├── (app)/quests/      # Quests (lista, criação, sub-missões)
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
- [x] Autenticação — login, signup, logout explícito (botão em Configurações)
- [x] Recuperação de senha — forgot-password → e-mail (Mailpit em dev) → reset-password
- [x] Roteamento inteligente na raiz (`/`)
- [x] Onboarding em 5 etapas — `/step-1` a `/step-5` com botão "← Voltar" em todas
  - Step 1: nome do usuário
  - Step 2: quiz de arquétipo (5 perguntas → resultado com % por arquétipo)
  - Step 3: seleção de pilares com criação de sub-pilares vinculados a pais
  - Step 4: contexto por pilar — perguntas com chips multiselect + "Outro" (texto livre)
  - Step 5: resumo completo — frase personalizada, barras de arquétipo, pilares com tags de contexto
- [x] Sistema de arquétipos — 4 tipos (Explorador, Focado, Construtor, Visionário) com combinação % única por pessoa; salvo em `profiles.archetype`; injetado no system prompt da IA
- [x] Sub-pilares hierárquicos — `pillar_relationships` (muitos-para-muitos); XP propaga 100% recursivamente para todos os ancestrais; sub-pilares excluídos do cálculo de nível do personagem
- [x] Contexto de pilar — respostas do onboarding salvas em `user_pillars.context` (JSONB); IA usa no system prompt
- [x] Dashboard home — radar de vida SVG, cards de pilares com barra de XP
- [x] Registro de atividades — modal com seleção de pilar, tempo, preview de XP ao vivo, bônus automáticos
- [x] Histórico de atividades — timeline agrupada por dia, total de XP diário e semanal, badges de bônus
- [x] Configurações — dados da conta, troca de senha, logout
- [x] Nav compartilhada — AppNav com Home, Quests, Histórico, IA, Configurações
- [x] Quests — lista, criação com sub-missões, XP máx 10.000, conclusão e abandono
- [x] Chat com IA local — `/chat`; streaming via Ollama (qwen2.5:14b na Goma); contexto completo do usuário (pilares, arquétipo, histórico, quests); histórico salvo em `ai_conversations`; markdown renderizado; botão limpar histórico; 3 pontinhos animados enquanto processa

---

## 12b. O que está implementado (mobile — Expo SDK 56)

- [x] Auth — login e signup nativos com `supabase.auth.signInWithPassword` / `signUp`
- [x] Sessão persistida em `AsyncStorage` (sessão sobrevive a restarts do app)
- [x] Roteamento inteligente — root `_layout.tsx` redireciona via `useAuth` + `useSegments`
- [x] Onboarding em 3 etapas idêntico ao web (nome → pilares → confirmação)
- [x] Dashboard home — radar de vida (react-native-svg), cards de pilares com barra de XP, pull-to-refresh
- [x] Registro de atividades — bottom sheet com seleção de pilar, presets de tempo, preview de XP + bônus
- [x] Histórico — FlatList agrupada por dia, badges de bônus, pull-to-refresh
- [x] Configurações — dados da conta, troca de senha, logout com confirmação
- [x] Tab bar (Home / Histórico / Quests / Config) com tema escuro
- [x] Quests — tela com lista de quests, criação com sub-missões, conclusão e abandono (`app/(app)/quests.tsx`); tab "Quests" (ícone ⚔) adicionada

### Arquitetura mobile
| Arquivo | Responsabilidade |
|---------|-----------------|
| `app/_layout.tsx` | Root layout — auth guard via `useAuth` + `useSegments` |
| `hooks/use-auth.ts` | Sessão + perfil do Supabase; escuta `onAuthStateChange` |
| `lib/supabase.ts` | `createClient` com `AsyncStorage` para persistência |
| `lib/activity.ts` | Detecção de bônus (incluindo `active_quest` +40%) + `logActivity` com parâmetro opcional `questId?` |
| `constants/theme.ts` | Paleta de cores espelhando `globals.css` do web |
| `components/LifeRadar.tsx` | Radar SVG com `react-native-svg` (mesma matemática do web) |
| `components/LogActivityModal.tsx` | Bottom sheet de registro de atividade |
| `app/(app)/quests.tsx` | Tela de quests: lista, criação, sub-missões, conclusão e abandono |
| `app/(app)/_layout.tsx` | Tab bar com 4 tabs (Home / Histórico / Quests / Config) |

### Decisão técnica mobile
- Sem `@supabase/ssr` no mobile — usa `createClient` do `supabase-js` direto com `AsyncStorage`
- Bônus de atividade calculados no `lib/activity.ts` (sem Server Actions) com a mesma lógica do web
- Após onboarding, usa `supabase.auth.refreshSession()` para forçar re-fetch do perfil no `useAuth` antes de redirecionar

### Aviso de ambiente local
- `EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` funciona no emulador/simulador.  
  **Para dispositivo físico:** substituir pelo IP da máquina na rede local (ex: `http://192.168.x.x:54321`)

---

## 13. Próximos temas a explorar

- [ ] **Seleção de foco** — pergunta "Em quais pilares quer focar agora?" no onboarding (sem limite) + seção "Pilares" em Configurações para ajustar depois
- [ ] **IA Opção B** — insights passivos opcionais (toggle nas configurações): IA observa dados e aparece com contexto proativo
- [ ] **Dashboard hierárquico** — mostrar sub-pilares indentados sob os pais no home
- [ ] **Criar sub-pilares pós-onboarding** — adicionar da home ou configurações
- [ ] Pulso/entrada do dia (experiência leve, "quando der" — nunca streak)
- [ ] Adaptador Obsidian — export markdown (fase 1)
- [ ] Sistema de insights automáticos entre pilares
- [ ] Integrações passivas (Apple Health, Google Fit, calendário)
- [ ] Modelo de monetização (quando abrir ao público)

---

## 13b. Integrações externas e padrão de adaptador

### Princípio
O núcleo do app **não conhece** nenhuma ferramenta externa. Integrações vivem em **adaptadores plugáveis na borda** (connector pattern). Assim o app funciona 100% sem nenhuma integração, e cada integração é opcional e isolada — se falhar, não derruba o app.

### Obsidian (primeiro adaptador)
- **Modelo:** híbrido. O Postgres é a fonte da verdade; o Obsidian é um espelho **opcional** em markdown.
- **Projeção:** cada entrada vira markdown — frontmatter com o estruturado (pilar, data, tempo, XP, id, links), corpo com o texto livre; `[[links]]` viram as conexões entre entradas/pilares/quests (substrato do motor de insights).
- **Fase 1:** export apenas (mão única). O usuário standalone nunca sabe que o Obsidian existe.
- **Fase 2 (futuro):** import / duas vias, com resolução de conflito — só se o uso pedir.
- **Plataforma:** nasce como recurso desktop/web (acesso a pasta de vault no mobile, iOS especialmente, é problemático).

### Próximos adaptadores (mesmo encaixe)
- Apple Health / Google Fit (sono, passos, treino → camada 0 passiva)
- Calendário (agenda)

---

## 14. Como usar este documento

**Para continuar em outra sessão de IA:**
1. Cole este documento inteiro no início da conversa
2. Diga: *"Quero continuar desenvolvendo o Anima a partir deste PRD. [Próximo tema]"*
3. A IA terá todo o contexto das decisões já tomadas

**Para atualizar após novas decisões:**
- Adicione à seção "Decisões de design registradas"
- Atualize a seção relevante com o novo conceito
- Mova itens da lista "Próximos temas" para "O que está implementado" quando concluídos
