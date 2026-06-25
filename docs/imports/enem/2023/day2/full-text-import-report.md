# Relatório — ENEM 2023 D2 texto integral (Caderno 5 Amarelo)

Data: 2026-06-22

## Resumo

| Métrica | Valor |
| --- | --- |
| Esperadas (manifesto `ready_text`) | 55 |
| Localizadas no PDF | 55 |
| Transcritas | 55 |
| Completas (5 alternativas + prompt) | 55 |
| Verificadas (`verified: true`) | 55 |
| Inseridas no banco pontuado | 55 |
| Staging | 0 |
| Com erro | 0 |
| Duplicatas exatas | 0 |

## Distribuição

| Área | Quantidade |
| --- | --- |
| Ciências da Natureza | 32 |
| Matemática | 23 |

## Conteúdo estruturado

| Tipo | Quantidade |
| --- | --- |
| Blocos `formula` | 16 |
| Blocos `table` | 0 (tabelas textuais preservadas em parágrafos quando o parser não as estruturou) |
| Com `sourceCitation` | 8 |

## Banco oficial

| Métrica | Antes | Depois |
| --- | --- | --- |
| Total oficial | 94 | 149 |
| ENEM 2023 D1 | 84 | 84 |
| ENEM 2023 D2 | 0 | 55 |

## Q177 (anulada)

- Registrada em `src/data/questions/enem/2023/day2/annulledRegistry.ts`
- `officialStatus: 'annulled'`
- `answerKey: null`
- `eligibleForScoredSessions: false`
- `verified: false`
- **Ausente** do `officialQuestionBank` e de sessões pontuadas

## Exclusões respeitadas

- 35 questões `image_required` do manifesto **não** importadas
- Nenhuma questão visual no runtime pontuado
- Questões ENEM 2023 D1 e ENEM 2024 intactas

## IDs problemáticos

Nenhum após verificação final.

## Possíveis duplicatas por similaridade

Nenhuma duplicata exata. Similaridade alta não reportada na auditoria D2.

## Arquivos gerados

- `src/data/questions/enem/2023/day2/naturalSciences.ts`
- `src/data/questions/enem/2023/day2/mathematics.ts`
- `src/data/questions/enem/2023/day2/annulledRegistry.ts`
- `src/data/questions/enem/2023/day2/index.ts`
- `scripts/audit-enem-2023-day2-full-text.ts`

## UX preservada

- Tipografia de leitura da sessão mantida
- Retorno automático ao topo ao mudar questão
- Botão inferior “Sair da lição” **não** reintroduzido
