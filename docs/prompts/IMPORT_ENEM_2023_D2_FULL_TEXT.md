# PROMPT — IMPORTAÇÃO DAS 55 QUESTÕES TEXTUAIS DO ENEM 2023 — 2º DIA

Realize a ingestão integral das questões textuais do **ENEM 2023 — 2º dia — Caderno 5 Amarelo** no StudyLazy.

Use obrigatoriamente:

- `@docs/imports/enem/2023/day2/filter-manifest.json`
- `@docs/imports/enem/2023/day2/filter-report.md`
- `@docs/sources/enem/2023/d2-c5-amarelo/prova.pdf`
- `@docs/sources/enem/2023/d2-c5-amarelo/gabarito.pdf`
- `@src/data/questionTypes.ts`
- `@src/data/questionBank.ts`
- `@src/data/questionSelection.ts`
- `@src/data/enem2024Questions.ts`
- `@src/components/questions/QuestionContent.tsx`
- `@scripts/audit-question-bank.ts`

Não faça commit ou push.

---

## OBJETIVO

Processar todas as questões que atendam:

```ts
ingestionStatus === 'ready_text'
requiresMedia === false
officialStatus === 'valid'
eligibleForScoredSessions === true
```

Quantidade esperada:

```text
55 questões
```

Não interrompa após um lote parcial.

Não processar neste sprint:

- as 35 questões classificadas como `image_required`;
- nenhuma mídia;
- a questão 177 como questão pontuada;
- qualquer conteúdo fora do manifesto.

A questão 177 deve permanecer apenas no registro histórico do manifesto com:

```ts
officialStatus: 'annulled'
eligibleForScoredSessions: false
verified: false
answerKey: null
```

Ela não entra no banco de sessões pontuadas.

---

## DISTRIBUIÇÃO ESPERADA

O caderno possui:

```text
Ciências da Natureza: Q91 a Q135
Matemática: Q136 a Q180
```

O script deve calcular pelo manifesto a distribuição exata das 55 questões textuais entre:

- `natural_sciences`;
- `mathematics`.

Não codifique números inventados: derive a lista esperada diretamente do manifesto e valide que todos os registros `ready_text` foram processados.

---

## 1. AUDITORIA DA ARQUITETURA

Antes de editar, analise:

```text
src/data/questionTypes.ts
src/data/questionBank.ts
src/data/questionSelection.ts
src/data/enem2024Questions.ts
src/components/questions/QuestionContent.tsx
src/store/mistakeStore.ts
src/app/study-session.tsx
src/app/review-mistakes.tsx
scripts/audit-question-bank.ts
```

Confirme:

- tipo interno real;
- formato de alternativas;
- formato de resposta;
- taxonomia;
- suporte atual para fórmulas;
- suporte atual para tabelas;
- regras de elegibilidade;
- regras de verificação;
- forma de busca por ID;
- forma de renderização na sessão e revisão;
- regras de duplicidade.

Não crie tipos paralelos incompatíveis.

---

## 2. CAMPOS DE STATUS OFICIAL

Adapte o tipo real para suportar, sem quebrar dados antigos:

```ts
officialStatus?: 'valid' | 'annulled';
eligibleForScoredSessions?: boolean;
```

Regras de produção:

```ts
officialStatus === 'valid'
eligibleForScoredSessions === true
verified === true
originType === 'official_exam'
sourceVerified === true
```

Qualquer questão anulada, não verificada ou inelegível deve ficar fora de:

- sessões;
- meta diária;
- XP;
- streak;
- histórico pontuado;
- revisão adaptativa;
- simulados pontuados.

---

## 3. ORGANIZAÇÃO DOS ARQUIVOS

Crie:

```text
src/data/questions/enem/2023/day2/
  naturalSciences.ts
  mathematics.ts
  annulledRegistry.ts
  index.ts
```

Use:

```ts
export const enem2023Day2TextQuestions = [
  ...naturalSciencesQuestions,
  ...mathematicsQuestions,
];
```

`annulledRegistry.ts` deve registrar Q177 apenas para referência histórica, sem integração no banco pontuado.

Não colocar todos os registros em um único arquivo gigante.

---

## 4. TRANSCRIÇÃO FIEL

Para cada uma das 55 questões:

1. localizar a página pelo manifesto;
2. conferir visualmente no PDF oficial;
3. transcrever todo o texto-base;
4. transcrever todo o comando;
5. transcrever as cinco alternativas;
6. preservar fórmulas, unidades, expoentes, subscritos e símbolos;
7. preservar tabelas textuais completas;
8. conferir o gabarito no manifesto;
9. conferir novamente no gabarito oficial;
10. remover somente resíduos editoriais.

Não:

- resumir;
- parafrasear;
- gerar texto;
- inferir parte ilegível;
- alterar unidades;
- alterar símbolos;
- simplificar fórmulas;
- trocar alternativas;
- usar mídia faltante;
- misturar questões vizinhas.

---

## 5. CONTEÚDO ESTRUTURADO PARA EXATAS

O modelo atual de `supportTitle`, `supportText`, `sourceCitation`, `prompt` e `contentFormat` pode não ser suficiente para fórmulas e tabelas.

Estenda o schema de forma compatível, preferencialmente com blocos tipados:

```ts
type QuestionContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'formula'; latex: string; fallbackText: string }
  | { type: 'table'; columns: string[]; rows: string[][]; caption?: string }
  | { type: 'list'; items: string[] }
  | { type: 'citation'; text: string };
```

Campo opcional:

```ts
contentBlocks?: QuestionContentBlock[];
```

Regras:

- manter os campos antigos como fallback;
- não converter tabelas reais em parágrafos confusos;
- não perder símbolos matemáticos;
- toda fórmula precisa de `fallbackText`;
- não usar imagem para fórmulas que podem ser representadas em texto/LaTeX;
- renderizar no mobile e web;
- revisão deve usar o mesmo componente da sessão.

Caso o projeto já possua solução equivalente, reutilize-a.

---

## 6. RENDERIZAÇÃO DE FÓRMULAS E TABELAS

Atualize `QuestionContent.tsx` ou componente equivalente para renderizar:

- parágrafos;
- fórmulas;
- tabelas;
- listas;
- citações;
- prompt;
- alternativas.

Requisitos:

- largura responsiva;
- rolagem horizontal apenas para tabela realmente larga;
- fonte legível;
- expoentes e subscritos preservados;
- sem corte lateral;
- sem HTML inseguro;
- sem `dangerouslySetInnerHTML`;
- fallback textual quando a renderização matemática falhar;
- aparência consistente em web e mobile.

Não adicione dependência pesada sem verificar compatibilidade com Expo SDK 56.

---

## 7. METADADOS OBRIGATÓRIOS

Cada questão válida deve possuir, conforme o schema real:

```ts
externalId
originType
sourceVerified
verified
officialStatus
eligibleForScoredSessions
source
year
examDay
booklet
questionNumber
area
subject
topic
difficulty
requiresImage
requiresMedia
supportTitle
supportText
sourceCitation
prompt
contentBlocks
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
examDay: 2
booklet: 'Caderno 5 — Amarelo'
requiresImage: false
requiresMedia: false
officialStatus: 'valid'
eligibleForScoredSessions: true
```

---

## 8. VERIFICAÇÃO

Marque `verified: true` somente quando:

- questão exata localizada;
- texto completo;
- comando completo;
- cinco alternativas;
- fórmulas e tabelas completas;
- nenhuma mídia necessária;
- gabarito igual ao manifesto;
- gabarito igual ao documento oficial;
- caracteres corretos;
- unidades corretas;
- ausência de resíduos;
- ausência de conteúdo vizinho.

Se qualquer ponto falhar:

```ts
verified: false
```

Mantenha em staging e registre o motivo.

Não force aprovação para alcançar volume.

---

## 9. TAXONOMIA

### Ciências da Natureza

Classifique o componente predominante, quando possível:

- Física;
- Química;
- Biologia.

Preserve:

```ts
area: 'Ciências da Natureza'
```

ou o valor interno equivalente.

### Matemática

Use o subject interno compatível com o app:

```ts
subject: 'Matemática'
```

Classifique tópicos como:

- aritmética;
- porcentagem;
- razão e proporção;
- funções;
- probabilidade;
- estatística;
- geometria;
- análise combinatória;
- matemática financeira;
- grandezas e medidas.

Não invente enums incompatíveis.

---

## 10. GABARITO

Converta letras para o formato interno real.

Caso use índice:

```text
A → 0
B → 1
C → 2
D → 3
E → 4
```

A questão 177:

```ts
correctAnswer: null
answerKey: null
officialStatus: 'annulled'
eligibleForScoredSessions: false
verified: false
```

Não criar resposta fictícia para anulada.

---

## 11. EXPLICAÇÕES

As explicações são editoriais.

Devem:

- mostrar raciocínio suficiente;
- justificar a resposta;
- manter unidades;
- evitar saltos lógicos;
- não afirmar que são oficiais do Inep;
- não usar apenas “a correta é X”;
- não inventar dados.

Quando possível:

```ts
explanationOrigin: 'editorial'
explanationVerified: false
```

Para Matemática e Física, apresentar os passos essenciais sem excesso.

---

## 12. DUPLICIDADES

Compare contra:

- banco oficial atual;
- ENEM 2024;
- ENEM 2023 do 1º dia;
- staging;
- fixtures demo.

Verifique:

### External ID
Nenhuma repetição.

### Identidade oficial

```text
source + year + examDay + booklet + questionNumber
```

### Fingerprint textual
Normalize Unicode, espaços, quebras e pontuação editorial e combine:

```text
contentBlocks/supportText + prompt + options
```

### Similaridade
Liste possíveis duplicatas, sem excluir automaticamente.

Não considerar duas questões duplicadas apenas por usarem a mesma fórmula ou tema.

---

## 13. INTEGRAÇÃO

Integre somente:

```ts
isOfficialVerifiedQuestion(question)
&& question.officialStatus === 'valid'
&& question.eligibleForScoredSessions === true
&& question.requiresMedia === false
```

Confirme que:

- Natureza passa a ter questões oficiais;
- Matemática passa a ter questões oficiais;
- Q177 não entra;
- nenhuma visual entra sem mídia;
- nenhuma demo entra;
- questões do primeiro dia permanecem intactas.

---

## 14. AUDITORIA ESPECÍFICA

Crie:

```text
scripts/audit-enem-2023-day2-full-text.ts
```

Validar:

- exatamente 55 questões textuais processadas;
- lista derivada do manifesto;
- nenhum ID visual;
- Q177 ausente do banco pontuado;
- Q177 presente no registro histórico;
- IDs únicos;
- cinco alternativas;
- respostas válidas;
- gabarito igual ao manifesto;
- fórmulas com fallback;
- tabelas com colunas e linhas válidas;
- `officialStatus === 'valid'`;
- `eligibleForScoredSessions === true`;
- `requiresMedia === false`;
- caracteres UTF-8 corretos;
- sem resíduos de PDF;
- sem duplicatas.

Bloquear:

```text
�
Ã§
Ã£
â€œ
â€”
undefined
NaN
```

---

## 15. AUDITORIA GLOBAL

Atualize:

```text
scripts/audit-question-bank.ts
```

Mostrar:

```text
Total oficial
ENEM 2024
ENEM 2023 D1
ENEM 2023 D2
Ciências da Natureza
Matemática
Demos em produção
Anuladas em sessões
Duplicatas exatas
Possíveis duplicatas
```

Resultados obrigatórios:

```text
Demos em produção: 0
Anuladas em sessões: 0
Duplicatas exatas: 0
```

---

## 16. RELATÓRIO

Crie:

```text
docs/imports/enem/2023/day2/full-text-import-report.md
```

Incluir:

```text
Esperadas: 55
Localizadas:
Transcritas:
Completas:
Verificadas:
Inseridas:
Staging:
Com erro:
Duplicatas:
```

Separar por:

- Ciências da Natureza;
- Matemática.

Listar IDs problemáticos e motivo.

---

## 17. TELA DE REVISÃO

Adapte:

```text
src/app/dev/question-ingestion-review.tsx
```

Adicionar filtros:

- prova/dia;
- área;
- componente;
- tópico;
- status;
- erro;
- duplicidade;
- fórmula;
- tabela.

Exibir:

- conteúdo estruturado;
- fórmulas;
- tabelas;
- prompt;
- alternativas;
- gabarito;
- explicação;
- metadados;
- status.

Somente em `__DEV__`.

---

## 18. NÃO ALTERAR

Não alterar:

- XP;
- streak;
- histórico existente;
- gráficos;
- onboarding;
- tab bar;
- planos;
- pagamentos;
- 35 questões visuais;
- regras de pontuação fora da exclusão de anuladas;
- questões já validadas.

---

## 19. VALIDAÇÃO TÉCNICA

Execute:

```bash
npx tsx scripts/audit-enem-2023-day2-full-text.ts
npx tsx scripts/audit-question-bank.ts
npx tsc --noEmit
npx expo lint
npx expo export --platform web
```

Não faça commit ou push.

---

## RELATÓRIO FINAL

Informe:

1. total processado;
2. total inserido;
3. total em staging;
4. distribuição Natureza/Matemática;
5. fórmulas estruturadas;
6. tabelas estruturadas;
7. IDs problemáticos;
8. duplicatas;
9. tratamento da Q177;
10. total oficial antes;
11. total oficial depois;
12. resultado dos cinco comandos;
13. URL da revisão;
14. confirmação de zero demos, zero anuladas e zero questões visuais no runtime pontuado.


---

# REGRAS DE UX APROVADAS — NÃO REGREDIR

Antes desta importação, implemente e valide:

```text
@docs/prompts/FIX_STUDY_SESSION_READING_UX.md
```

Ao adaptar `QuestionContent` para fórmulas e tabelas, preserve:

- comando com aproximadamente 17 px;
- peso máximo 700;
- texto-base com peso normal;
- citação menor;
- largura responsiva;
- retorno automático ao topo quando a questão muda;
- ausência do botão inferior “Sair da lição”;
- saída somente pelo X superior com modal.

Não reintroduza tipografia gigante.

Não altere a lógica de rolagem corrigida.

Após o Dia 2, teste questões com fórmula, tabela, texto longo de Natureza e Matemática, sempre começando no topo.
