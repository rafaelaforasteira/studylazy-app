# Relatório — Importação integral ENEM 2023 (texto)

**Prova:** ENEM 2023 — 1º dia — Caderno 1 Azul  
**Data do relatório:** 2026-06-22  
**Branch:** `feature/official-question-bank-v2`

## Resumo

| Métrica | Valor |
|---|---:|
| Questões esperadas | 84 |
| Questões localizadas no PDF | 84 |
| Questões transcritas | 84 |
| Questões completas | 84 |
| Questões verificadas (`verified: true`) | 84 |
| Questões inseridas no runtime | 84 |
| Questões mantidas em staging | 0 |
| Questões com erro | 0 |
| Duplicatas exatas | 0 |
| Possíveis duplicatas por similaridade | 0 |

## Banco oficial

| Métrica | Antes | Depois |
|---|---:|---:|
| Total oficial no runtime | 10 | 94 |
| ENEM 2024 | 10 | 10 |
| ENEM 2023 textual | 0 | 84 |
| Demos em produção | 0 | 0 |

## Distribuição importada

| Grupo | Quantidade |
|---|---:|
| Inglês (ING-01 a ING-04) | 4 |
| Espanhol (ESP-02 a ESP-05) | 4 |
| Linguagens comuns (Q06–Q45, exc. mídia) | 36 |
| Ciências Humanas (Q47–Q90, exc. mídia) | 40 |
| **Total** | **84** |

## Distribuição no runtime por matéria

| Subject | Quantidade |
|---|---:|
| Português | 38 (2 ENEM 2024 + 36 ENEM 2023) |
| Ciências Humanas | 48 (8 ENEM 2024 + 40 ENEM 2023) |
| Inglês | 4 |
| Espanhol | 4 |

## Exclusões respeitadas (mídia / redação)

- `ENEM-2023-D1-C1-ING-05`
- `ENEM-2023-D1-C1-ESP-01`
- `ENEM-2023-D1-C1-Q24`
- `ENEM-2023-D1-C1-Q33`
- `ENEM-2023-D1-C1-Q34`
- `ENEM-2023-D1-C1-Q44`
- `ENEM-2023-D1-C1-Q46`
- `ENEM-2023-D1-C1-Q56`
- `ENEM-2023-D1-C1-Q72`
- `ENEM-2023-D1-C1-Q76`
- `ENEM-2023-D1-C1-Q89`
- `ENEM-2023-D1-C1-REDACAO`

## Auditoria de duplicidades (pré e pós integração)

### Nível 1 — `externalId`
- Nenhuma colisão entre ENEM 2023 e banco existente.
- IDs ENEM 2024 (`ENEM2024_D1_C1_AZ_Q*`) permanecem distintos dos IDs ENEM 2023 (`ENEM-2023-D1-C1-*`).

### Nível 2 — identidade oficial
- Comparação `source + year + examDay + booklet + questionNumber + languageTrack`.
- Mesmo número de questão em anos diferentes (ex.: Q38 2023 vs Q38 2024) **não** é duplicata.

### Nível 3 — fingerprint textual
- 0 duplicatas exatas no banco integrado.

### Nível 4 — alta similaridade
- 0 pares acima do limiar (85%) no banco final.

## Inglês e Espanhol

- **Repositório:** 8 questões oficiais verificadas em `src/data/questions/enem/2023/day1/foreignLanguages.ts`.
- **Sessão de Português:** excluídas automaticamente (`subject` = `Inglês` / `Espanhol`).
- **Status:** aguardam fluxo de escolha de idioma estrangeiro na navegação.

## Arquivos criados / alterados

```text
src/data/questionTypes.ts
src/data/questionFingerprint.ts
src/data/questionBank.ts
src/data/questions/enem/2023/day1/buildQuestion.ts
src/data/questions/enem/2023/day1/foreignLanguages.ts
src/data/questions/enem/2023/day1/languages.ts
src/data/questions/enem/2023/day1/humanSciences.ts
src/data/questions/enem/2023/day1/index.ts
src/app/dev/question-ingestion-review.tsx
scripts/audit-enem-2023-full-text.ts
scripts/audit-question-bank.ts
scripts/parse-enem-2023-extracted.ts
scripts/generate-enem-2023-question-files.ts
scripts/extract-enem-2023-pdf.ts
docs/imports/enem/2023/parsed-questions.json
docs/imports/enem/2023/extracted/
docs/imports/enem/2023/full-text-import-report.md
```

## Validação

| Comando | Resultado |
|---|---|
| `npx tsx scripts/audit-enem-2023-full-text.ts` | OK |
| `npx tsx scripts/audit-question-bank.ts` | OK |
| `npx tsc --noEmit` | OK |
| `npx expo lint` | OK |
| `npx expo export --platform web` | OK |

## Tela de revisão (dev)

- Rota: `/dev/question-ingestion-review`
- Protegida por `__DEV__`
- Fora da tab bar e dos menus de produção

## Problemas por questão

Nenhum `externalId` com erro bloqueante após a validação final.

## Notas

- Transcrição baseada no PDF oficial (`docs/sources/enem/2023/d1-c1-azul/prova.pdf`) com extração automatizada e revisão estrutural.
- Gabaritos conferidos contra `filter-manifest.json` e `gabarito.pdf`.
- Explicações são **editoriais** (`explanationOrigin: 'editorial'`, `explanationVerified: false`).
- As 10 questões ENEM 2024 **não foram alteradas**.
