import { demoQuestionBank } from '../src/data/fixtures/demoQuestions';
import {
  getOfficialQuestionsForSubject,
  getQuestionBankStats,
  getQuestionsForLesson,
  officialQuestionBank,
} from '../src/data/questionBank';
import {
  auditQuestionDuplicates,
  buildQuestionFingerprint,
} from '../src/data/questionFingerprint';
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
const duplicateReport = auditQuestionDuplicates(officialQuestionBank);

const subjectDistribution = officialQuestionBank.reduce<Record<string, number>>(
  (accumulator, question) => {
    const subject = question.subject ?? '—';
    accumulator[subject] = (accumulator[subject] ?? 0) + 1;
    return accumulator;
  },
  {}
);

const languageDistribution = officialQuestionBank.reduce<Record<string, number>>(
  (accumulator, question) => {
    const track = question.languageTrack ?? 'common';
    accumulator[track] = (accumulator[track] ?? 0) + 1;
    return accumulator;
  },
  {}
);

console.log('=== Banco oficial ===');
console.log(`Questões oficiais no runtime: ${stats.totalOfficialQuestions}`);
console.log(`Total ENEM 2024: ${stats.totalEnem2024}`);
console.log(`Total ENEM 2023: ${stats.totalEnem2023}`);
console.log(`Total ENEM 2023 D1: ${stats.totalEnem2023Day1}`);
console.log(`Total ENEM 2023 D2: ${stats.totalEnem2023Day2}`);
console.log(`Questões demo no runtime de produção: ${stats.totalDemoInProduction}`);
console.log(
  `Português oficiais disponíveis: ${stats.officialBySubject['Português']}`
);
console.log(
  `Ciências Humanas oficiais disponíveis: ${stats.officialBySubject['Ciências Humanas']}`
);
console.log(
  `Ciências da Natureza oficiais disponíveis: ${stats.officialBySubject['Ciências da Natureza'] ?? 0}`
);
console.log(
  `Matemática oficiais disponíveis: ${stats.officialBySubject['Matemática'] ?? 0}`
);
console.log(`Inglês oficiais disponíveis: ${stats.officialBySubject['Inglês']}`);
console.log(`Espanhol oficiais disponíveis: ${stats.officialBySubject['Espanhol']}`);
console.log(`Fixtures demo (somente dev/teste): ${demoQuestionBank.length}`);
console.log(`officialQuestionBank.length: ${officialQuestionBank.length}`);

console.log('\n=== Distribuição por subject ===');
Object.entries(subjectDistribution)
  .sort((a, b) => b[1] - a[1])
  .forEach(([subject, count]) => {
    console.log(`${subject}: ${count}`);
  });

console.log('\n=== Distribuição por idioma ===');
Object.entries(languageDistribution)
  .sort((a, b) => b[1] - a[1])
  .forEach(([track, count]) => {
    console.log(`${track}: ${count}`);
  });

console.log('\n=== Duplicidades ===');
console.log(
  `Duplicatas por externalId: ${duplicateReport.externalIdDuplicates.length}`
);
console.log(
  `Duplicatas por identidade oficial: ${duplicateReport.identityDuplicates.length}`
);
console.log(
  `Duplicatas por fingerprint: ${duplicateReport.fingerprintDuplicates.length}`
);
console.log(
  `Possíveis duplicatas por similaridade: ${duplicateReport.highSimilarity.length}`
);
duplicateReport.highSimilarity.slice(0, 10).forEach((item) => {
  console.log(
    `  ${item.idA} ~ ${item.idB} (${(item.similarity * 100).toFixed(1)}%) — ${item.reason}`
  );
});

if (stats.totalDemoInProduction !== 0) {
  throw new Error('Demos em produção deve ser 0');
}

if (
  duplicateReport.externalIdDuplicates.length > 0 ||
  duplicateReport.identityDuplicates.length > 0 ||
  duplicateReport.fingerprintDuplicates.length > 0
) {
  throw new Error('Duplicatas exatas encontradas no banco oficial');
}

const portuguese = auditSession('Português — solicitado 5', 'Português', 5);
const humanas = auditSession(
  'Ciências Humanas — solicitado 5',
  'Ciências Humanas',
  5
);
const matematica = auditSession('Matemática — solicitado 5', 'Matemática', 5);
const natureza = auditSession(
  'Ciências da Natureza — solicitado 5',
  'Ciências da Natureza',
  5
);

const annulledInRuntime = officialQuestionBank.filter(
  (question) =>
    question.officialStatus === 'annulled' ||
    question.eligibleForScoredSessions === false
).length;

console.log(`\nAnuladas em sessões: ${annulledInRuntime}`);

if (matematica.session.length !== 5 || matematica.demoCount !== 0) {
  throw new Error('Auditoria de Matemática falhou');
}

if (natureza.session.length !== 5 || natureza.demoCount !== 0) {
  throw new Error('Auditoria de Ciências da Natureza falhou');
}

if (annulledInRuntime !== 0) {
  throw new Error('Questões anuladas não podem estar no banco pontuado');
}

if (portuguese.session.length !== 5 || portuguese.demoCount !== 0) {
  throw new Error('Auditoria de Português falhou');
}

if (
  portuguese.officialCount !== 5 ||
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
    session.length !== 5 ||
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

console.log('\nDemos em produção: 0');
console.log('Anuladas em sessões: 0');
console.log('Duplicatas exatas: 0');
console.log('Auditoria global concluída com sucesso.');
