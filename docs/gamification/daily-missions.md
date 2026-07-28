# Missões diárias

## Visão geral

O StudyLazy oferece **4 missões diárias** locais (funcionam offline, sem login obrigatório) para incentivar estudo consistente.

Não há pagamento real. Missões extras / recompensas avançadas são benefício futuro listado em `/pro`.

## Missões do dia

| Missão | Target | Recompensa ao resgatar |
| ------ | ------ | ---------------------- |
| Complete 1 lição | 1 | +10 XP |
| Responda 10 questões | 10 | +10 XP |
| Acerte 7 questões | 7 | +10 XP |
| Revise 3 erros | 3 | +10 XP |

**Bônus:** completar todas as missões do dia → **+1 fragmento de vida** (sistema de fragmentos existente; com 5/5 vidas não acumula fragmento infinito).

## Reset diário

- `dateKey` usa data **local** (`YYYY-MM-DD`).
- Ao mudar o dia, o store regenera as 4 missões com progresso zerado.
- Persistência: Zustand + AsyncStorage (`studylazy-daily-missions`).

## Como o progresso é registrado

### Sessão de estudo

Ao **concluir** uma sessão (`saveLessonProgress`, com proteção anti-duplo):

- `complete_lesson` +1
- `answer_questions` + questões efetivamente respondidas
- `correct_answers` + acertos

Sessão abandonada (sair sem salvar) **não** conta. Duplo toque não duplica (trava + flag `hasSavedProgress`).

### Revisão de erros

Cada resposta confirmada na revisão (acerto **ou** erro) incrementa `review_mistakes` +1. A revisão continua **sem consumir vidas**; acerto elegível ainda pode gerar fragmento via fluxo de revisão existente.

## Recompensas

1. Missão atinge o target → status `completed`.
2. Usuário toca **Resgatar** → +10 XP (uma vez) → status `claimed`.
3. Todas concluídas → **Resgatar fragmento** → 1 fragmento via `grantLifeFragment` (uma vez por dia).

XP de missão usa `addBonusXp` no progresso (não altera streak nem `computeLessonResult`).

## UI

- Card `DailyMissionsCard` em **Estudar** e **Você**.
- Dev: `/dev/missions-health` (`__DEV__`).

## Como testar

```bash
npx tsx scripts/test-daily-missions.ts
npx tsx scripts/audit-daily-missions.ts
```

Manual: abrir `/dev/missions-health`, simular progresso, resgatar, forçar novo dia.

## Limitações do beta

- Sem sync de missões via Supabase (estado local do aparelho).
- Sem missões Pro extras.
- Sem compra de progresso.
- Fragmento do bônus respeita teto de vidas existente.
