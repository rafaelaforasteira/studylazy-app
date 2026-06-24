import {
  getQuestionBankStats,
  getQuestionsForLesson,
  isEnemSourceQuestion,
} from '../src/data/questionBank';

function formatQuestionRow(
  position: number,
  question: {
    id: number | string;
    externalId?: string;
    source?: string;
    subject?: string;
  }
) {
  return [
    `posição ${position}`,
    `id=${String(question.id)}`,
    `externalId=${question.externalId ?? '—'}`,
    `source=${question.source ?? '—'}`,
    `subject=${question.subject ?? '—'}`,
  ].join(' | ');
}

function printSession(label: string, subject: string, amount: number) {
  const session = getQuestionsForLesson({ subject, amount });
  const enemCount = session.filter(isEnemSourceQuestion).length;

  console.log(`\n${label} — ${amount} questões`);
  console.log(`Quantidade ENEM: ${enemCount}`);
  session.forEach((question, index) => {
    console.log(formatQuestionRow(index + 1, question));
  });

  return { session, enemCount };
}

function assertNoDuplicates(
  session: Array<{ id: number | string; externalId?: string }>
) {
  const keys = session.map(
    (question) => String(question.externalId ?? question.id)
  );
  const unique = new Set(keys);

  if (unique.size !== keys.length) {
    throw new Error(`Sessão com duplicatas: ${keys.join(', ')}`);
  }
}

function runSimulations(
  subject: string,
  amount: number,
  runs: number
) {
  const enemCounts: number[] = [];
  const enemPositions: number[] = [];
  let failures = 0;

  for (let seed = 1; seed <= runs; seed += 1) {
    const session = getQuestionsForLesson({
      subject,
      amount,
      shuffleSeed: seed,
    });

    if (session.length !== amount) {
      failures += 1;
      continue;
    }

    try {
      assertNoDuplicates(session);
    } catch {
      failures += 1;
      continue;
    }

    const enemCount = session.filter(isEnemSourceQuestion).length;
    enemCounts.push(enemCount);

    const enemIndex = session.findIndex(isEnemSourceQuestion);
    if (enemIndex >= 0) {
      enemPositions.push(enemIndex + 1);
    }

    if (enemCount < 1) {
      failures += 1;
    }
  }

  const uniquePositions = [...new Set(enemPositions)];

  return {
    failures,
    minEnem: enemCounts.length > 0 ? Math.min(...enemCounts) : 0,
    maxEnem: enemCounts.length > 0 ? Math.max(...enemCounts) : 0,
    positionSpread: uniquePositions.sort((a, b) => a - b),
  };
}

const stats = getQuestionBankStats();

console.log('=== Banco ===');
console.log(`Total de questões no banco final: ${stats.totalQuestions}`);
console.log(`Total de questões ENEM no banco final: ${stats.totalEnemQuestions}`);
console.log(
  `ENEM elegíveis para Português: ${stats.enemEligibleBySubject['Português']}`
);
console.log(
  `ENEM elegíveis para Ciências Humanas: ${stats.enemEligibleBySubject['Ciências Humanas']}`
);

const requiredIds = [
  'ENEM2024_D1_C1_AZ_Q02',
  'ENEM2024_D1_C1_AZ_Q38',
  'ENEM2024_D1_C1_AZ_Q48',
];

requiredIds.forEach((externalId) => {
  const found = stats.enemExternalIds.includes(externalId);
  console.log(`${externalId}: ${found ? 'presente' : 'AUSENTE'}`);
});

console.log('\n=== Fluxo real da sessão (Teoria · 5 questões) ===');
console.log(
  'Chamada: getQuestionsForLesson({ subject, amount: Number(duration) })'
);
console.log(
  'Exemplo real: subject="Português", duration="5", type="Teoria", amount=5'
);

const portugueseResult = printSession('Português', 'Português', 5);
const humanasResult = printSession('Ciências Humanas', 'Ciências Humanas', 5);

if (portugueseResult.enemCount < 1) {
  throw new Error('Português amount=5 não retornou ENEM');
}

if (humanasResult.enemCount < 1) {
  throw new Error('Ciências Humanas amount=5 não retornou ENEM');
}

assertNoDuplicates(portugueseResult.session);
assertNoDuplicates(humanasResult.session);

const sampleEnem =
  portugueseResult.session.find(isEnemSourceQuestion) ??
  humanasResult.session.find(isEnemSourceQuestion);

if (sampleEnem) {
  console.log('\nMetadados completos da questão ENEM selecionada:');
  console.log(
    JSON.stringify(
      {
        externalId: sampleEnem.externalId,
        source: sampleEnem.source,
        year: sampleEnem.year,
        area: sampleEnem.area,
        subject: sampleEnem.subject,
        statement: `${sampleEnem.question.slice(0, 48)}…`,
      },
      null,
      2
    )
  );
}

console.log('\n=== 20 simulações (seeds 1..20) ===');

const portugueseSim = runSimulations('Português', 5, 20);
const humanasSim = runSimulations('Ciências Humanas', 5, 20);

console.log('Português:');
console.log(`  falhas: ${portugueseSim.failures}`);
console.log(`  ENEM por sessão: min=${portugueseSim.minEnem}, max=${portugueseSim.maxEnem}`);
console.log(
  `  posições ENEM observadas: ${portugueseSim.positionSpread.join(', ') || 'nenhuma'}`
);

console.log('Ciências Humanas:');
console.log(`  falhas: ${humanasSim.failures}`);
console.log(`  ENEM por sessão: min=${humanasSim.minEnem}, max=${humanasSim.maxEnem}`);
console.log(
  `  posições ENEM observadas: ${humanasSim.positionSpread.join(', ') || 'nenhuma'}`
);

if (portugueseSim.failures > 0 || humanasSim.failures > 0) {
  throw new Error('Simulações falharam');
}

console.log('\nSessão antiga reutilizada: não há persistência de questões da sessão; cada navegação envia startedAt novo.');
