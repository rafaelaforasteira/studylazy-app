# Conquistas e níveis

## Visão geral

O StudyLazy possui:

1. **Conquistas** persistentes (desbloqueio único, offline, sem login obrigatório).
2. **Níveis do aluno** derivados do XP total acumulado.

Não há pagamento real. Conquistas especiais e níveis avançados são benefício futuro em `/pro`.

## O que existia antes

- Níveis simples: `getLevelInfo` com **200 XP por nível** (linear, sem nomes fixos).
- Conquistas **derivadas** em `calculateAchievements` (`profileAnalytics`) — calculadas na hora, sem store/persistência.
- Badge de “Revisão de erro” nas questões (não é conquista de progresso).

## Conquistas iniciais (16)

| ID | Título | Meta |
| -- | ------ | ---- |
| first_lesson | Primeira lição | 1 |
| lessons_5 | 5 lições | 5 |
| lessons_10 | 10 lições | 10 |
| questions_10 / 50 / 100 | Questões respondidas | 10 / 50 / 100 |
| correct_10 / 50 | Acertos | 10 / 50 |
| first_review | Primeira revisão | 1 |
| reviews_10 | 10 revisões | 10 |
| life_recovered_from_review | Vida recuperada na revisão | 1 |
| all_daily_missions | Todas as missões do dia | 1 |
| streak_3 / streak_7 | Streak | 3 / 7 |
| xp_100 / xp_500 | XP acumulado | 100 / 500 |

Regras:

- desbloqueia **uma vez**;
- persiste em AsyncStorage (`studylazy-achievements`);
- não salva enunciado de questão;
- feedback: “Nova conquista desbloqueada!”

## Integração de eventos

| Evento | Onde |
| ------ | ---- |
| Lição concluída + XP/streak | `studyProgressStore.completeLesson` |
| Questões/acertos da sessão | `study-session` (contagem real respondida) |
| Revisão respondida | `review-mistakes` |
| Vida recuperada na revisão | `review-mistakes` quando `recoveredLife` |
| Missão / todas as missões | `missionStore` |
| XP bônus (missões) | `addBonusXp` → `recordXpChanged` |

## Níveis (XP)

| Nível | XP mínimo | Nome |
| ----- | --------- | ---- |
| 1 | 0 | Iniciante |
| 2 | 100 | Focado |
| 3 | 250 | Persistente |
| 4 | 500 | Treinando Forte |
| 5 | 900 | Estrategista |
| 6 | 1400 | Dominando a Base |
| 7 | 2000 | Rumo ao ENEM |
| 8 | 2800 | Alta Performance |
| 9 | 3700 | Quase Imparável |
| 10 | 5000 | Lenda StudyLazy |

`getLevelInfo` / títulos no dashboard usam essa tabela (`src/levels/levelLogic.ts`). A lógica de **como o XP é ganho** (sessão / missões) permanece a mesma.

## UI

- `LevelProgressCard` e `AchievementsCard` em **Você** e **Atividade**.
- Dev: `/dev/achievements-health`.

## Como testar

```bash
npx tsx scripts/test-achievements-and-levels.ts
npx tsx scripts/audit-achievements-and-levels.ts
```

## Limitações do beta

- Conquistas locais (não sync via Supabase nesta versão).
- Sem conquistas Pro exclusivas.
- Sem recompensa paga por conquista.
