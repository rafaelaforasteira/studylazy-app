# NPS e feedback do beta

## Objetivo

Coletar satisfação (NPS) e feedback qualitativo durante o beta gratuito, sem pagamento e sem bloquear o estudo.

## Quando o NPS aparece

Automático (após sessão / vidas zeradas):

- App já aberto há pelo menos **1 hora** (não na primeira abertura)
- Pelo menos **2 sessões** de estudo concluídas
- Sem dispensa temporária ativa
- Cooldown de **7 dias** após mostrar ou “Agora não”
- Após enviar NPS, espera **30 dias** para perguntar de novo

Manual:

- Card **Avaliar o StudyLazy** em Você
- Rota `/feedback` → Avaliar experiência

Nunca aparece no meio de uma questão.

## Como interpretar o NPS

| Score | Grupo |
| ----- | ----- |
| 0–6 | Detrator |
| 7–8 | Neutro (passive) |
| 9–10 | Promotor |

**NPS** = % promotores − % detratores (sobre respostas com nota).

### Detratores

1. Ler comentário e campo “o que melhorar”
2. Priorizar bugs e atritos (vidas, sync, teclado, login)
3. Responder em canal de suporte se o usuário deixou contato fora do app
4. Não pressionar nova avaliação imediatamente

### Promotores

1. Pedir indicação a amigos (sem incentivo pago no beta)
2. Anotar o que eles mais gostam (conteúdo, XP, retry…)
3. Usar depoimentos com permissão explícita

## Onde ver feedbacks

| Local | Uso |
| ----- | --- |
| `/dev/feedback-dashboard` | Painel local (dev) — totais, NPS, comentários |
| Supabase `user_feedback` | Após criar a tabela (equipe) |
| `/feedback` | Envio manual de bug/sugestão/NPS |

## SQL da tabela

Ver `docs/supabase/user-feedback-table.sql`.

Crie a tabela manualmente no Supabase. Se estiver ausente, o app **não quebra**: feedback fica `pending` no aparelho.

## Offline e sync

1. Feedback é salvo localmente (Zustand + AsyncStorage)
2. `useFeedbackSync` tenta enviar em background (separado da sync de progresso)
3. Falha → status `failed`/`pending` + retry no foreground
4. Convidado: envia com `guest_id` (deviceId); logado: `user_id`

Não envia: tokens, senhas, enunciados, payload de progresso.

## Liberar para 5 usuários

1. Criar tabela + RLS no Supabase
2. Build preview com variáveis Supabase
3. Pedir que cada um complete ≥2 sessões
4. Abrir Você → Avaliar o StudyLazy (ou aguardar prompt)
5. Revisar `/dev/feedback-dashboard` e Table Editor
6. Classificar dores: vidas, conteúdo, bugs, UX

## Avaliar o sistema de vidas

No painel e nos comentários, filtre menções a “vida(s)”.

Sinais de irritação:

- Detratores citando espera / bloqueio
- Bugs: vidas não regeneram / perda duplicada

Sinais positivos:

- Promotores citando ritmo / foco
- Poucas reclamações após entender a regra

Ajuste só com evidência — não remova vidas no beta sem dados.

## Checklist

Atualizado em `docs/beta/free-beta-launch-checklist.md`.
