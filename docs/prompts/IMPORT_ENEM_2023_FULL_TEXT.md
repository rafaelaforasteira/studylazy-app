# PROMPT — IMPORTAÇÃO INTEGRAL DAS 84 QUESTÕES TEXTUAIS DO ENEM 2023

Realize a ingestão integral das questões textuais do **ENEM 2023 — 1º dia — Caderno 1 Azul** no StudyLazy.

Use obrigatoriamente como fontes:

- `@docs/imports/enem/2023/filter-manifest.json`
- `@docs/imports/enem/2023/filter-report.md`
- `@docs/sources/enem/2023/d1-c1-azul/prova.pdf`
- `@docs/sources/enem/2023/d1-c1-azul/gabarito.pdf`
- `@src/data/questionBank.ts`
- `@src/data/questionTypes.ts`
- `@src/data/enem2024Questions.ts`
- `@src/data/questionSelection.ts`
- `@src/data/validateEnemQuestions.ts`
- `@scripts/audit-question-bank.ts`

Não faça commit ou push.

---

## OBJETIVO

Processar **todas as questões** do manifesto que satisfaçam:

```ts
ingestionStatus === 'ready_text'
requiresMedia === false
```

Quantidade esperada:

```text
84 questões
```

Não interrompa após 10, 20 ou 40 questões.

Não incluir neste sprint:

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
- a proposta `ENEM-2023-D1-C1-REDACAO`

Esses 11 itens dependem de mídia. A redação pertence a outro módulo.

---

## DISTRIBUIÇÃO ESPERADA

```text
Inglês: 4
  ING-01 a ING-04

Espanhol: 4
  ESP-02 a ESP-05

Linguagens comuns: 36
  Q06 a Q45, excluindo Q24, Q33, Q34 e Q44

Ciências Humanas: 40
  Q46 a Q90, excluindo Q46, Q56, Q72, Q76 e Q89

Total: 84
```

---

## 1. AUDITORIA DA ARQUITETURA ATUAL

Antes de editar, analise o schema real do projeto.

Confirme:

- tipo interno de questão;
- formato das alternativas;
- formato da resposta correta;
- taxonomia de `area`, `subject` e `topic`;
- regras de `verified`;
- regra usada por `officialQuestionBank`;
- forma como `QuestionContent` renderiza textos estruturados;
- como questões oficiais de 2024 foram modeladas;
- como a sessão seleciona questões;
- como a revisão encontra questões por ID;
- como o banco global detecta duplicidades.

Não crie um segundo modelo incompatível.

Não altere as questões oficiais de 2024.

---

## 2. ORGANIZAÇÃO DOS ARQUIVOS

Crie:

```text
src/data/questions/enem/2023/day1/
  foreignLanguages.ts
  languages.ts
  humanSciences.ts
  index.ts
```

Distribuição:

```text
foreignLanguages.ts  → 8 questões
languages.ts         → 36 questões
humanSciences.ts     → 40 questões
```

No `index.ts`, exporte:

```ts
export const enem2023Day1TextQuestions = [
  ...foreignLanguageQuestions,
  ...languageQuestions,
  ...humanSciencesQuestions,
];
```

Use o tipo real do projeto.

Não coloque as 84 questões em um arquivo único.

---

## 3. TRANSCRIÇÃO FIEL

Para cada questão:

1. localizar a página indicada pelo manifesto;
2. localizar a questão exata no PDF oficial;
3. transcrever integralmente título, texto-base e referências;
4. transcrever integralmente o comando;
5. transcrever as cinco alternativas;
6. conferir a letra no manifesto;
7. conferir novamente no gabarito oficial;
8. limpar somente resíduos editoriais;
9. validar acentuação e caracteres;
10. preservar o conteúdo oficial.

Não:

- resumir;
- parafrasear;
- modernizar;
- completar texto por inferência;
- gerar enunciados;
- trocar palavras;
- alterar alternativas;
- alterar o gabarito;
- misturar questões vizinhas;
- usar OCR quebrado sem revisão visual do PDF.

Remova apenas:

- cabeçalho e rodapé;
- número de página;
- código de impressão;
- nome do caderno repetido;
- marcas de coluna;
- texto pertencente a outra questão;
- quebras artificiais causadas pela diagramação.

---

## 4. TEXTO ESTRUTURADO

Utilize os campos existentes do StudyLazy:

```ts
supportTitle?: string;
supportText?: string;
sourceCitation?: string;
prompt: string;
contentFormat?: 'prose' | 'verse';
```

Ordem visual:

```text
Título
Texto-base
Fonte/citação
Comando
Alternativas
```

Regras:

- poemas, canções e versos: `contentFormat: 'verse'`;
- prosa: `contentFormat: 'prose'`;
- preservar parágrafos reais;
- remover quebras artificiais;
- não concatenar tudo em um bloco pesado;
- manter o campo de compatibilidade apenas quando o projeto exigir.

---

## 5. CAMPOS OBRIGATÓRIOS

Cada questão deve possuir, conforme o schema real:

```ts
externalId
originType
sourceVerified
verified
source
year
examDay
booklet
questionNumber
languageTrack
area
subject
topic
difficulty
requiresImage
supportTitle
supportText
sourceCitation
prompt
contentFormat
options
correctAnswer
explanation
```

Valores-base:

```ts
originType: 'official_exam'
sourceVerified: true
source: 'ENEM 2023'
year: 2023
examDay: 1
booklet: 'Caderno 1 — Azul'
requiresImage: false
```

Use `requiresMedia` apenas se o schema atual também o exigir.

---

## 6. REGRA DE VERIFICAÇÃO

Marque `verified: true` apenas quando a questão passar por todos os critérios:

- localização inequívoca no PDF;
- enunciado completo;
- texto-base completo;
- comando completo;
- cinco alternativas completas;
- gabarito igual ao manifesto;
- gabarito igual ao arquivo oficial;
- ausência de conteúdo de questão vizinha;
- ausência de mídia necessária;
- ausência de resíduos editoriais;
- ausência de caracteres quebrados.

Quando qualquer item falhar:

```ts
verified: false
```

Mantenha a questão no staging e registre o motivo.

Não force aprovação para atingir a meta de volume.

---

## 7. GABARITO

O manifesto fornece letras.

Converta para o formato interno real.

Caso o app utilize índice numérico:

```text
A → 0
B → 1
C → 2
D → 3
E → 4
```

A letra do manifesto e o gabarito oficial precisam coincidir.

Qualquer divergência deve bloquear `verified: true`.

---

## 8. TAXONOMIA

Classifique com base no conteúdo real.

### Língua estrangeira

Preserve:

```ts
languageTrack: 'english'
```

ou:

```ts
languageTrack: 'spanish'
```

Não misture Inglês ou Espanhol nas sessões de Português.

Caso essas matérias ainda não existam na navegação:

- mantenha as questões no repositório oficial;
- exclua-as temporariamente da seleção comum;
- registre no relatório que aguardam o fluxo de escolha de idioma.

### Linguagens

As questões Q06–Q45 podem envolver:

- Língua Portuguesa;
- Literatura;
- Artes;
- Educação Física;
- Comunicação;
- linguagem digital.

Use `subject` compatível com o app e preserve o componente específico em `topic` ou campo equivalente.

### Ciências Humanas

Classifique, quando possível, entre componentes como:

- História;
- Geografia;
- Filosofia;
- Sociologia.

Não invente valores incompatíveis com o schema atual.

---

## 9. EXPLICAÇÕES

As explicações são editoriais, não oficiais do Inep.

Elas devem:

- justificar a alternativa correta;
- apontar a evidência do texto-base;
- explicar por que a resposta atende ao comando;
- evitar conteúdo externo não sustentado;
- não afirmar que a explicação veio do Inep;
- não ser apenas “a resposta correta é a letra X”.

Quando o schema permitir, use:

```ts
explanationOrigin: 'editorial'
explanationVerified: false
```

A fidelidade da questão e do gabarito é independente da revisão editorial da explicação.

---

## 10. AUDITORIA DE DUPLICIDADES

Antes da integração, compare as 84 questões contra:

- `officialQuestionBank`;
- questões do ENEM 2024;
- outros arquivos oficiais;
- staging;
- fixtures demo.

### Nível 1 — `externalId`

Não pode haver IDs duplicados.

### Nível 2 — identidade oficial

Compare:

```text
source + year + examDay + booklet + questionNumber + languageTrack
```

Inglês e Espanhol precisam permanecer distintos.

### Nível 3 — fingerprint textual

Crie uma normalização que:

- aplique Unicode NFC;
- converta para minúsculas;
- remova espaços duplicados;
- normalize quebras;
- remova diferenças editoriais irrelevantes;
- combine título, apoio, comando e alternativas.

Duas questões com fingerprint idêntico não podem coexistir.

### Nível 4 — alta similaridade

Identifique possíveis duplicatas com IDs diferentes.

Não apague automaticamente por similaridade.

Registre:

```text
ID A
ID B
grau de similaridade
motivo
decisão
```

Questões de anos diferentes não são duplicadas apenas porque tratam do mesmo tema.

---

## 11. QUESTÃO JÁ EXISTENTE

Quando uma questão de 2023 já existir no projeto:

- não criar uma segunda cópia;
- manter o registro canônico;
- preservar o ID usado em histórico/revisão;
- complementar campos ausentes;
- não alterar o gabarito sem validação;
- registrar a ocorrência no relatório.

---

## 12. INTEGRAÇÃO NO BANCO OFICIAL

Integre somente questões que satisfaçam:

```ts
originType === 'official_exam'
sourceVerified === true
verified === true
requiresImage === false
```

O runtime deve continuar excluindo:

- demos;
- questões incompletas;
- questões com mídia ausente;
- `verified: false`;
- redação.

Não substituir as 10 questões oficiais de 2024.

Se todas as 84 forem aprovadas:

```text
ENEM 2024: 10
ENEM 2023 textual: 84
Total oficial: 94
```

Questões de Inglês e Espanhol podem existir no repositório oficial sem serem misturadas à sessão de Português.

---

## 13. AUDITORIA DAS 84 QUESTÕES

Crie:

```text
scripts/audit-enem-2023-full-text.ts
```

Valide:

- exatamente 84 registros processados;
- exatamente 8 de língua estrangeira;
- exatamente 36 de Linguagens comuns;
- exatamente 40 de Ciências Humanas;
- todos os IDs esperados;
- nenhum ID inesperado;
- IDs únicos;
- nenhuma duplicata exata contra o banco atual;
- cinco alternativas;
- alternativas não vazias;
- resposta válida;
- resposta compatível com o manifesto;
- `requiresImage === false`;
- nenhuma proposta de redação;
- nenhum dos 11 IDs visuais;
- prompt não vazio;
- texto-base quando necessário;
- fonte e ano;
- caracteres UTF-8 válidos;
- ausência de resíduos editoriais.

Bloqueie padrões quebrados, como:

```text
�
Ã§
Ã£
Ã©
â€œ
â€
â€”
undefined
NaN
```

O script deve falhar com mensagens claras e IDs dos registros problemáticos.

---

## 14. AUDITORIA GLOBAL DO BANCO

Atualize:

```text
scripts/audit-question-bank.ts
```

Relatório obrigatório:

```text
Total oficial no runtime
Total ENEM 2024
Total ENEM 2023
Total de demos em produção
Duplicatas por externalId
Duplicatas por identidade oficial
Duplicatas por fingerprint
Possíveis duplicatas por similaridade
Distribuição por subject
Distribuição por idioma
```

Resultados obrigatórios:

```text
Demos em produção: 0
Duplicatas exatas: 0
```

---

## 15. RELATÓRIO

Crie:

```text
docs/imports/enem/2023/full-text-import-report.md
```

Inclua:

```text
Questões esperadas: 84
Questões localizadas no PDF:
Questões transcritas:
Questões completas:
Questões verificadas:
Questões inseridas:
Questões mantidas em staging:
Questões com erro:
Duplicatas exatas:
Possíveis duplicatas:
```

Separe por:

- Inglês;
- Espanhol;
- Linguagens;
- Ciências Humanas.

Para cada problema, liste `externalId` e motivo.

---

## 16. TELA DE REVISÃO

Crie ou adapte:

```text
src/app/dev/question-ingestion-review.tsx
```

Recursos:

- filtro por área;
- filtro por idioma;
- filtro por status;
- filtro por erro;
- filtro por duplicidade;
- busca por `externalId`;
- busca por texto;
- navegação entre as 84;
- título;
- apoio;
- citação;
- comando;
- alternativas;
- gabarito;
- explicação;
- metadados;
- status e problemas.

Regras:

- somente desenvolvimento;
- protegida por `__DEV__`;
- não aparece na tab bar;
- não aparece em menus de produção;
- não altera XP, histórico ou revisão.

---

## 17. NÃO ALTERAR

Não altere:

- XP;
- streak;
- progresso;
- histórico;
- revisão de erros;
- relatos;
- gráficos;
- onboarding;
- tab bar;
- planos;
- pagamentos;
- regras de conclusão;
- 10 questões oficiais de 2024;
- 11 questões dependentes de mídia;
- proposta de redação.

---

## 18. COMANDOS DE VALIDAÇÃO

Execute:

```bash
npx tsx scripts/audit-enem-2023-full-text.ts
npx tsx scripts/audit-question-bank.ts
npx tsc --noEmit
npx expo lint
npx expo export --platform web
```

Não faça commit ou push.

---

## RELATÓRIO FINAL OBRIGATÓRIO

Informe:

1. total processado;
2. total localizado;
3. total transcrito;
4. total aprovado;
5. total inserido;
6. total mantido em staging;
7. IDs com problemas;
8. duplicatas exatas encontradas;
9. possíveis duplicatas;
10. total oficial antes;
11. total oficial depois;
12. distribuição por matéria;
13. situação de Inglês e Espanhol;
14. resultado dos cinco comandos;
15. endereço da tela de revisão;
16. confirmação de que nenhuma questão demo entrou em produção.
