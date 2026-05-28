# LifeGame — Product Requirements Document
> Documento vivo de design. Última atualização reflete todas as decisões tomadas até agora.
> Para retomar o projeto em qualquer IA: cole este documento e diga "quero continuar desenvolvendo o LifeGame a partir deste PRD."

---

## 1. Visão geral

**Nome provisório:** LifeGame  
**Plataformas:** Desktop, Web, Mobile (todas)  
**Estágio atual:** Conceito estruturado — ainda não há código  
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

### O que foi REMOVIDO da versão anterior
- ~~Dificuldade percebida (1–3)~~ — subjetivo demais, removido
- ~~Frequência punindo XP~~ — desmotivador, removido. Consistência só recompensa.

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
  - Relações/Mente: estados binários com XP fixo por categoria (saiu de relação tóxica, começou terapia)

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

### Filosofia da curva
- Níveis 1–10 rápidos: cria hábito antes de qualquer compromisso sério
- Níveis 11–35: coração do produto, cobre anos de uso real
- Níveis 46–50: quase inalcançável por design — símbolo real quando abrir ao público

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

O usuário nunca é obrigado — o app mostra o que está disponível, a escolha é sempre livre.

---

## 7. Onboarding (primeiro login)

5 etapas. Duração estimada: 3–5 minutos.

### Etapa 1 — Você
- Campo: nome (como quer ser chamado)
- **REMOVIDO:** pergunta sobre "momento que está vivendo" — vaga, sem ancoragem objetiva, não alimenta nenhuma decisão do sistema

### Etapa 2 — Pilares
- Apresenta os 7 pilares padrão pré-selecionados
- Usuário pode desmarcar (mínimo 3)
- Usuário pode adicionar pilares extras (Espiritualidade, Criatividade, etc.)

### Etapa 3 — Estado atual
- Sliders de 1–10 por pilar ativo
- **Finalidade:** diagnóstico visual apenas — o usuário vê onde está
- **IMPORTANTE:** esses valores NÃO carregam nível inicial. Todos começam do nível 1 em todos os pilares. Quem tem nível alto vai naturalmente subir mais rápido pelo uso.
- Mensagem de contexto: "Ninguém mais vê isso — seja honesto com você mesmo"

### Etapa 4 — Prioridades
- Usuário escolhe até 3 pilares para focar nos próximos 3 meses
- Esses pilares recebem sugestões de quest prioritárias
- Afeta as sugestões do app, não o XP

### Etapa 5 — Personagem
- Exibe o personagem criado: nome, nível 1, radar inicial baseado nos sliders
- Apresenta os pilares ativos e as prioridades escolhidas
- Nota explicativa: "Esses valores são sua linha de base. Cada ação registrada constrói seu personagem a partir daqui."
- CTA: "Começar a jornada"

---

## 8. Decisões de design registradas

| Decisão | Escolha feita | Motivo |
|---------|--------------|--------|
| Nível do personagem | Média dos níveis dos pilares | Representa a vida completa, não uma área só |
| Âncora de XP | Tempo (único input do usuário) | Objetivo, não infláveis |
| Dificuldade percebida | Removida | Subjetiva demais |
| Frequência punindo XP | Removida | Desmotivador |
| Nível inicial pelo onboarding | Removido | XP deve ser ganho, não declarado |
| Stack técnica | React Native + Expo + Next.js + Supabase + TypeScript | Multiplataforma real, compartilhamento de lógica, início rápido sem infra |
| Início do desenvolvimento | Web + Mobile simultâneos (monorepo) | Mesmo código, mesma experiência desde o dia 1 |
| Pilares | Customizáveis por usuário | Cada vida é diferente |
| XP de quests | Definido antes de começar | Remove viés de inflação pós-conclusão |

---

## 9. Stack técnica

### Decisão
Híbrido React Native + Next.js compartilhando lógica e tipos em TypeScript.

### Frontend
| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Mobile (iOS + Android) | React Native + Expo | App nativo real, um código só, sem PWA |
| Web + Desktop | Next.js | Mesmo projeto do backend, zero overhead |
| Linguagem | TypeScript strict | Tipos compartilhados entre mobile e web |

### Backend
| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| API | Next.js API Routes | Sem servidor extra, co-locado com o frontend web |
| Banco de dados | PostgreSQL via Supabase | Robusto para histórico e cálculo de XP |
| Auth | Supabase Auth | Pronto para uso, não precisa construir |
| Cache | Redis (quando necessário) | Performance em cálculos de XP e ranking |
| Realtime | Supabase Realtime | Sync entre dispositivos do mesmo usuário |

### Por que Supabase no início
- Postgres + Auth + Realtime prontos — foco no produto, não em infra
- Fácil de migrar para infraestrutura própria quando escalar
- Plano gratuito generoso para desenvolvimento solo

### Estrutura de repositório
```
lifegame/
├── apps/
│   ├── mobile/          # React Native + Expo
│   └── web/             # Next.js (web + API)
├── packages/
│   ├── core/            # lógica de XP, níveis, quests (compartilhada)
│   ├── types/           # TypeScript types compartilhados
│   └── ui/              # componentes compartilhados (opcional)
└── CLAUDE.md            # contexto para Claude Code
```

### CLAUDE.md inicial (para Claude Code)
```markdown
# LifeGame

Leia `lifegame-prd.md` antes de qualquer tarefa.

## Stack
- Mobile: React Native + Expo (apps/mobile)
- Web: Next.js (apps/web)
- Backend: Next.js API Routes (apps/web/pages/api)
- Banco: Supabase (PostgreSQL + Auth + Realtime)
- Linguagem: TypeScript strict em tudo

## Comandos
- `npm run dev:web` — Next.js dev server
- `npm run dev:mobile` — Expo dev server
- `npm run build` — build de produção
- `npm test` — Jest

## Convenções
- TypeScript strict, sem `any`
- Commits em português, modo imperativo
- Lógica de negócio em packages/core, nunca nos apps
```

---

## 10. Próximos temas a explorar

- [ ] Tela principal pós-onboarding (home do app)
- [ ] Fluxo de criação de uma quest
- [ ] Check-in diário (como é a experiência de 30 segundos)
- [ ] Sistema de insights automáticos entre pilares
- [ ] Schema do banco de dados (tabelas e relações)
- [ ] Modelo de monetização (quando abrir ao público)
- [ ] Verificação social leve para eventos (v2, quando público)
- [ ] Integrações externas (Apple Health, Google Fit, calendário)

**Resolvidos:**
- [x] Stack técnica — React Native + Expo + Next.js + Supabase + TypeScript
- [x] Sistema de XP — fórmula, bônus automáticos, eventos
- [x] Sistema de níveis e eras
- [x] Onboarding — 5 etapas definidas
- [x] Fluxo Chat (ideação) → PRD (ponte) → Claude Code (execução)

---

## 10. Como usar este documento

**Para continuar em outra sessão de IA:**
1. Cole este documento inteiro no início da conversa
2. Diga: *"Quero continuar desenvolvendo o LifeGame a partir deste PRD. [Próximo tema]"*
3. A IA terá todo o contexto das decisões já tomadas

**Para atualizar após novas decisões:**
- Adicione à seção "Decisões de design registradas"
- Atualize a seção relevante com o novo conceito
- Mova itens da lista "Próximos temas" para as seções correspondentes quando explorados
