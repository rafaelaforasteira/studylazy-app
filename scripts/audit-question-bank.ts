import { demoQuestionBank } from '../src/data/fixtures/demoQuestions';
import {
  getOfficialQuestionsForSubject,
  getQuestionBankStats,
  getQuestionsForLesson,
  officialQuestionBank,
} from '../src/data/questionBank';
import { getQuestionKey } from '../src/data/questionTypes';

function formatQuestionRow(
  position: number,
  question: {
    id: number | string;
    externalId?: string;
    source?: string;
    subject?: string;
    originType?: string;
  }
) {
  return [
    `posição ${position}`,
    `id=${String(question.id)}`,
    `externalId=${question.externalId ?? '—'}`,
    `source=${question.source ?? '—'}`,
    `subject=${question.subject ?? '—'}`,
    `originType=${question.originType ?? '—'}`,
  ].join(' | ');
}

function countByOrigin(
  session: Array<{ originType?: string }>,
  originType: string
) {
  return session.filter((question) => question.originType === originType)
    .length;
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

function auditSession(label: string, subject: string, amount: number) {
  const session = getQuestionsForLesson({ subject, amount });
  const officialCount = countByOrigin(session, 'official_exam');
  const demoCount = countByOrigin(session, 'demo');

  console.log(`\n${label}`);
  console.log(`Quantidade real: ${session.length}`);
  console.log(`Questões demo: ${demoCount}`);
  console.log(`Questões oficiais: ${officialCount}`);
  session.forEach((question, index) => {
    console.log(formatQuestionRow(index + 1, question));
  });

  try {
    assertNoDuplicates(session);
    console.log('Duplicatas: 0');
  } catch (error) {
    console.log(`Duplicatas: FALHA (${String(error)})`);
    throw error;
  }

  return { session, officialCount, demoCount };
}

const stats = getQuestionBankStats();

console.log('=== Banco oficial ===');
console.log(`Questões oficiais no runtime: ${stats.totalOfficialQuestions}`);
console.log(`Questões demo no runtime de produção: ${stats.totalDemoInProduction}`);
console.log(
  `Português oficiais disponíveis: ${stats.officialBySubject['Português']}`
);
console.log(
  `Ciências Humanas oficiais disponíveis: ${stats.officialBySubject['Ciências Humanas']}`
);
console.log(`Fixtures demo (somente dev/teste): ${demoQuestionBank.length}`);
console.log(
  `officialQuestionBank.length: ${officialQuestionBank.length}`
);

const portuguese = auditSession(
  'Português — solicitado 5',
  'Português',
  5
);
const humanas = auditSession(
  'Ciências Humanas — solicitado 5',
  'Ciências Humanas',
  5
);
const matematica = getQuestionsForLesson({
  subject: 'Matemática',
  amount: 5,
});

console.log('\nMatemática — solicitado 5');
console.log(`Quantidade real: ${matematica.length}`);
console.log(
  matematica.length === 0
    ? 'Estado de indisponibilidade: OK (array vazio)'
    : 'FALHA: retornou questões sem banco oficial'
);

if (portuguese.session.length !== 2 || portuguese.demoCount !== 0) {
  throw new Error('Auditoria de Português falhou');
}

if (
  portuguese.officialCount !== 2 ||
  humanas.session.length !== 5 ||
  humanas.demoCount !== 0 ||
  humanas.officialCount !== 5
) {
  throw new Error('Auditoria de sessões oficiais falhou');
}

console.log('\n=== 20 simulações ===');
let failures = 0;

for (let seed = 1; seed <= 20; seed += 1) {
  const session = getQuestionsForLesson({
    subject: 'Português',
    amount: 5,
    shuffleSeed: seed,
  });

  if (
    session.length !== 2 ||
    session.some((question) => question.originType !== 'official_exam')
  ) {
    failures += 1;
  }

  const keys = session.map(getQuestionKey);
  if (new Set(keys).size !== keys.length) {
    failures += 1;
  }
}

console.log(`Falhas nas 20 simulações de Português: ${failures}`);
console.log(
  `Disponíveis oficiais em Português: ${getOfficialQuestionsForSubject('Português').length}`
);

if (failures > 0) {
  throw new Error('Simulações falharam');
}
