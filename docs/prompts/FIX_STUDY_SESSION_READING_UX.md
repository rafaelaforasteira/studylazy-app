# CORREÇÃO — LEITURA E NAVEGAÇÃO DA SESSÃO DE ESTUDO

Corrija a experiência de leitura e navegação da sessão de estudo do StudyLazy.

Use a captura anexada como referência do problema visual.

Não faça commit ou push.

## Problemas confirmados

1. O comando/pergunta está grande, pesado e visualmente cansativo.
2. Ao avançar para a próxima questão, a rolagem permanece no final da questão anterior.
3. O botão inferior “Sair da lição” é desnecessário.
4. O X superior, com modal de confirmação, deve ser a única saída explícita.

## Auditoria

Analise:

- `src/app/study-session.tsx`
- `src/app/review-mistakes.tsx`
- `src/components/questions/QuestionContent.tsx`
- componentes de alternativas e feedback
- o container rolável real
- o modal acionado pelo X

## Tipografia

### Texto-base

```ts
fontSize: 16
fontWeight: '400'
lineHeight: 25
```

### Citação

```ts
fontSize: 12–13
fontWeight: '400'
lineHeight: 18–20
```

### Comando/pergunta

```ts
fontSize: 17
fontWeight: '600' ou '700'
lineHeight: 25
```

Regras:

- não usar 22–24 px;
- não usar peso 800 ou 900;
- `marginTop` entre 18 e 24;
- `marginBottom` entre 16 e 20;
- largura `100%`;
- `flexShrink: 1`;
- `minWidth: 0`;
- quebra natural, sem linhas artificiais.

### Alternativas

```ts
fontSize: 15–16
fontWeight: '500' ou '600'
lineHeight: 22–24
```

## Layout

No card:

- largura `100%`;
- `minWidth: 0`;
- padding horizontal de 20–24;
- sem largura fixa inadequada;
- sem estouro lateral;
- espaçamento vertical consistente.

## Voltar ao topo ao trocar de questão

Use referência do container rolável:

```ts
const scrollRef = useRef<ScrollView>(null);
```

Ao mudar `currentQuestionIndex` ou o identificador da questão:

```ts
useEffect(() => {
  requestAnimationFrame(() => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  });
}, [currentQuestionIndex, currentQuestion?.externalId]);
```

Adapte ao código real.

Requisitos:

- funcionar em mobile e web;
- rolar o container correto;
- não disparar ao apenas selecionar alternativa;
- funcionar depois de responder e avançar;
- nova questão deve aparecer imediatamente no topo;
- aplicar também à revisão, caso haja navegação entre questões na mesma tela.

## Remover botão inferior

Remova completamente:

```text
Sair da lição
```

Remova também espaço, estilos e handlers usados apenas por esse botão.

Mantenha o X superior.

## Fluxo do X

O X deve:

1. abrir modal de confirmação;
2. oferecer continuar;
3. oferecer sair;
4. funcionar em web e mobile.

## Não alterar

Não altere banco de questões, gabaritos, XP, streak, histórico, relatos, gráficos, onboarding, tab bar, planos ou pagamentos.

## Testes

Teste questão curta, longa, verso, Humanas, cinco avanços seguidos, web e viewport mobile.

Confirme:

- comando agradável;
- nova questão sempre começa no topo;
- botão inferior removido;
- X e modal funcionando.

## Validação técnica

```bash
npx tsc --noEmit
npx expo lint
npx expo export --platform web
```

No relatório final, informe causa, tipografia final, container corrigido, gatilho do scroll, arquivos alterados e resultado dos comandos.
