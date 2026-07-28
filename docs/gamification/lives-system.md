# Sistema de vidas e retry de erros

## Visão geral

O StudyLazy usa um sistema de **vidas** inspirado no Duolingo e uma **fila de retry** para priorizar questões erradas nas próximas sessões da mesma matéria.

Não há pagamento real nesta versão beta. Pro com vidas ilimitadas é apenas conceito futuro / simulação local em dev.

## Regras de vidas

| Regra | Valor |
| ----- | ----- |
| Máximo | 5 |
| Free | começa com 5 |
| Erro em questão (sessão de estudo) | −1 vida |
| Acerto | não perde vida |
| 0 vidas | não inicia nova lição |
| 0 vidas no meio da sessão | encerra com mensagem amigável (progresso salvo) |
| Regeneração | +1 vida a cada **30 minutos** |
| Teto | nunca passa de 5 |
| Pro futuro | vidas ilimitadas, sem precisar esperar recarga |

### Revisão de erros e fragmentos

| Regra | Valor |
| ----- | ----- |
| Erro na revisão dedicada | **não** perde vida |
| Acerto na revisão | +1 **fragmento** (metade de uma vida) |
| 2 fragmentos | +1 vida completa |
| Com 5/5 vidas | não acumula fragmentos |
| Pro / unlimited | sem recompensa de fragmento |

Mensagens discretas:

- 1º fragmento: “Boa! Você recuperou metade de uma vida.”
- Vida completa: “Excelente! Você recuperou 1 vida.”

### Proteções

- Duplo toque / resposta reprocessada: mesma `stableQuestionId` não perde vida duas vezes na sessão.
- Questão já respondida: trava de confirmação impede segunda perda.
- **Tela de revisão de erros não consome vidas** (UX deliberada).
- Recompensa de fragmento: no máximo **uma vez por** `stableQuestionId` (histórico leve ≤ 200).
- Anti-duplo-toque na revisão: `answerLockRef` + `rewardedKeysRef` + `lastReviewRewardKey` no store.
- Não recompensa demo / anulada / Q177 / questão sem mapeamento oficial.
- Histórico guarda só `{ stableQuestionId, rewardedAt }` — nunca enunciado.

### Offline

Estado persistido em AsyncStorage (`studylazy-lives`), inclusive `lifeFragments` e `reviewRewardHistory`. Regeneração e recompensas de revisão são calculadas no cliente.

## Free / Pro

- Free: 5 vidas com regeneração + recuperação via revisão (fragmentos).
- Pro (futuro / `devProEnabled`): `isUnlimited = true` — não bloqueia estudo e ignora recompensa de revisão.
- Tela `/pro` lista “Vidas ilimitadas, sem precisar esperar recarga.” sem compra.

## Retry de erro

Arquivos:

- `src/retry/retryQueueTypes.ts`
- `src/retry/retryQueueLogic.ts`
- `src/store/retryQueueStore.ts`

Fluxo:

1. Errou questão → `recordMiss(stableQuestionId, subject)`
2. Próxima sessão da matéria → seleção mistura **40–60%** retries ativos + questões novas
3. Acertou → `recordCorrect` reduz prioridade (`active: false`)
4. Sem duplicata na mesma sessão (IDs únicos)
5. Badge discreto: **Revisão de erro**

A fila guarda **apenas** `stableQuestionId` + metadata mínima (matéria, contagem, timestamps). Não salva enunciado/alternativas.

O motor em `questionSelection.ts` continua filtrando apenas oficiais verificadas (sem demo, anuladas ou Q177).

## Como testar

### Automático

```bash
npx tsx scripts/test-lives-system.ts
npx tsx scripts/audit-lives-system.ts
npx tsx scripts/test-review-life-rewards.ts
npx tsx scripts/audit-review-life-rewards.ts
```

### Manual (dev)

1. Abrir `/dev/lives-health`
2. Perder vidas até 0 → tentar iniciar sessão em Estudar
3. Aguardar regeneração ou usar “Recuperar 1 vida”
4. Usar “Adicionar fragmento” / “Completar 1 vida por revisão”
5. Errar questões → ver badge “Revisão de erro” na sessão seguinte da mesma matéria
6. Acertar na revisão dedicada → ver +1/2 ou vida recuperada

### Checklist beta

Ver item de vidas em `docs/beta/free-beta-launch-checklist.md`.

## Limitações do beta

- Sem compra / restauração de vidas pagas
- Regeneração por tempo + fragmentos via revisão (sem anúncios)
- Retry é local (não sincroniza fila via Supabase nesta versão)
- Revisão dedicada não gasta vidas; acerto recupera meia vida
