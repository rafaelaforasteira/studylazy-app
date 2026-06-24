import {
  enem2024HumanasQuestions,
  enem2024LinguagensQuestions,
} from './enem2024Questions';
import {
  composeLessonQuestions,
  isEnemSourceQuestion,
} from './questionSelection';
import type { Question } from './questionTypes';

export type { Question } from './questionTypes';
export { allEnem2024Questions } from './enem2024Questions';
export {
  calculateEnemCount,
  composeLessonQuestions,
  getQuestionKey,
  isEnemSourceQuestion,
} from './questionSelection';

type GetQuestionsForLessonParams = {
  subject: string;
  amount: number;
  seenQuestionIds?: string[];
  shuffleSeed?: number;
};

function isEnemQuestion(question: Question) {
  return isEnemSourceQuestion(question);
}

const portugueseQuestions: Question[] = [
  {
    id: 1,
    question: 'Qual é a classe gramatical da palavra "casa"?',
    options: ['Verbo', 'Substantivo', 'Adjetivo', 'Advérbio'],
    correctAnswer: 'Substantivo',
  },
  {
    id: 2,
    question: 'Em "Maria correu rápido", qual é o verbo?',
    options: ['Maria', 'Correu', 'Rápido', 'Nenhuma'],
    correctAnswer: 'Correu',
  },
  {
    id: 3,
    question: 'Qual alternativa apresenta um adjetivo?',
    options: ['Mesa', 'Bonito', 'Correr', 'Ontem'],
    correctAnswer: 'Bonito',
  },
  {
    id: 4,
    question: 'Qual pontuação encerra uma pergunta?',
    options: ['Ponto final', 'Vírgula', 'Interrogação', 'Dois pontos'],
    correctAnswer: 'Interrogação',
  },
  {
    id: 5,
    question: 'Qual palavra está escrita corretamente?',
    options: ['Excessão', 'Exceção', 'Eceção', 'Excesão'],
    correctAnswer: 'Exceção',
  },
  {
    id: 6,
    question: 'Qual é o plural de "cidadão"?',
    options: ['Cidadões', 'Cidadãos', 'Cidadães', 'Cidadons'],
    correctAnswer: 'Cidadãos',
  },
  {
    id: 7,
    question: 'A palavra "feliz" é:',
    options: ['Substantivo', 'Adjetivo', 'Verbo', 'Artigo'],
    correctAnswer: 'Adjetivo',
  },
  {
    id: 8,
    question: 'Em "o menino estudou", a palavra "o" é:',
    options: ['Artigo', 'Verbo', 'Adjetivo', 'Advérbio'],
    correctAnswer: 'Artigo',
  },
];
const mathQuestions: Question[] = [
  {
    id: 1,
    question: 'Quanto é 8 x 7?',
    options: ['54', '56', '64', '48'],
    correctAnswer: '56',
  },
  {
    id: 2,
    question: 'Qual é o resultado de 25 + 17?',
    options: ['32', '40', '42', '47'],
    correctAnswer: '42',
  },
  {
    id: 3,
    question: 'Quanto é 100 dividido por 4?',
    options: ['20', '25', '30', '40'],
    correctAnswer: '25',
  },
  {
    id: 4,
    question: 'Qual é o próximo número: 2, 4, 6, 8...',
    options: ['9', '10', '11', '12'],
    correctAnswer: '10',
  },
  {
    id: 5,
    question: 'Quanto é 12 + 13?',
    options: ['23', '24', '25', '26'],
    correctAnswer: '25',
  },
  {
    id: 6,
    question: 'Quanto é 9 x 6?',
    options: ['45', '54', '56', '63'],
    correctAnswer: '54',
  },
  {
    id: 7,
    question: 'Qual é metade de 80?',
    options: ['20', '30', '40', '50'],
    correctAnswer: '40',
  },
  {
    id: 8,
    question: 'Quanto é 15 - 7?',
    options: ['6', '7', '8', '9'],
    correctAnswer: '8',
  },
];

const writingQuestions: Question[] = [
  {
    id: 1,
    question: 'Qual parte da redação apresenta o tema e a tese?',
    options: ['Introdução', 'Desenvolvimento', 'Conclusão', 'Título'],
    correctAnswer: 'Introdução',
  },
  {
    id: 2,
    question: 'Na redação, a tese é:',
    options: [
      'Uma pergunta sem resposta',
      'A opinião central defendida no texto',
      'Uma citação obrigatória',
      'O último parágrafo',
    ],
    correctAnswer: 'A opinião central defendida no texto',
  },
  {
    id: 3,
    question: 'O desenvolvimento serve principalmente para:',
    options: [
      'Apresentar argumentos',
      'Criar o título',
      'Fazer a saudação',
      'Repetir a introdução',
    ],
    correctAnswer: 'Apresentar argumentos',
  },
  {
    id: 4,
    question: 'A conclusão de uma redação deve:',
    options: [
      'Abrir um novo assunto',
      'Finalizar a ideia defendida',
      'Ignorar o tema',
      'Trazer apenas perguntas',
    ],
    correctAnswer: 'Finalizar a ideia defendida',
  },
  {
    id: 5,
    question: 'Qual opção combina mais com uma proposta de intervenção?',
    options: [
      'Agente, ação, meio e finalidade',
      'Somente opinião pessoal',
      'Apenas uma pergunta',
      'Uma lista de palavras soltas',
    ],
    correctAnswer: 'Agente, ação, meio e finalidade',
  },
];

const humanSciencesQuestions: Question[] = [...enem2024HumanasQuestions];

const portugueseQuestionsWithEnem: Question[] = [
  ...portugueseQuestions,
  ...enem2024LinguagensQuestions,
];

const generalQuestions: Question[] = [
  ...portugueseQuestionsWithEnem,
  ...mathQuestions,
  ...writingQuestions,
  ...humanSciencesQuestions,
];

const ALL_QUESTION_BANKS: Question[][] = [
  portugueseQuestions,
  portugueseQuestionsWithEnem,
  mathQuestions,
  writingQuestions,
  humanSciencesQuestions,
  generalQuestions,
];

export function getAllQuestions() {
  const seen = new Set<string>();
  const all: Question[] = [];

  ALL_QUESTION_BANKS.flat().forEach((question) => {
    const key = `${String(question.externalId ?? question.id)}::${question.question}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    all.push(question);
  });

  return all;
}

export function findQuestionByExternalId(externalId: string) {
  return getAllQuestions().find(
    (question) =>
      question.externalId === externalId ||
      String(question.id) === externalId
  );
}

export function findQuestionByStatement(statement: string) {
  return getAllQuestions().find((question) => question.question === statement);
}

export function findQuestionReference({
  externalId,
  statement,
}: {
  externalId?: string;
  statement: string;
}) {
  if (externalId) {
    return (
      findQuestionByExternalId(externalId) ??
      findQuestionByStatement(statement)
    );
  }

  return findQuestionByStatement(statement);
}

export function getQuestionBankStats() {
  const all = getAllQuestions();
  const enem = all.filter(isEnemQuestion);

  const enemBySubject = {
    'Português': enem.filter((question) => question.subject === 'Português')
      .length,
    'Ciências Humanas': enem.filter(
      (question) => question.subject === 'Ciências Humanas'
    ).length,
  };

  return {
    totalQuestions: all.length,
    totalEnemQuestions: enem.length,
    enemEligibleBySubject: enemBySubject,
    enemExternalIds: enem.map((question) =>
      String(question.externalId ?? question.id)
    ),
  };
}

export function getEnemQuestionsForSubject(subject: string) {
  return getQuestionBankBySubject(subject).filter(isEnemQuestion);
}

export function hasQuestionSourceBadges(question: Question) {
  return Boolean(question.source && question.area);
}

function getQuestionBankBySubject(subject: string) {
  switch (subject) {
    case 'Português':
      return portugueseQuestionsWithEnem;

    case 'Matemática':
      return mathQuestions;

    case 'Redação':
      return writingQuestions;

    case 'Ciências Humanas':
      return humanSciencesQuestions;

    case 'Questões':
      return generalQuestions;

    case 'Desafio rápido':
      return generalQuestions;

    default:
      return generalQuestions;
  }
}

export function getQuestionsForLesson({
  subject,
  amount,
  seenQuestionIds,
  shuffleSeed,
}: GetQuestionsForLessonParams) {
  const eligibleQuestions = getQuestionBankBySubject(subject).map(
    (question) => ({
      ...question,
      subject: question.subject ?? subject,
    })
  );

  return composeLessonQuestions(eligibleQuestions, {
    amount,
    seenQuestionIds,
    shuffleSeed,
  });
}

function assertEnemQuestionBankIntegration() {
  const stats = getQuestionBankStats();
  const requiredIds = [
    'ENEM2024_D1_C1_AZ_Q02',
    'ENEM2024_D1_C1_AZ_Q38',
    'ENEM2024_D1_C1_AZ_Q48',
  ];

  if (stats.totalEnemQuestions !== 10) {
    throw new Error(
      `Banco ENEM inválido: esperado 10 questões, encontrado ${stats.totalEnemQuestions}`
    );
  }

  requiredIds.forEach((externalId) => {
    if (!stats.enemExternalIds.includes(externalId)) {
      throw new Error(`Questão ENEM ausente no banco final: ${externalId}`);
    }
  });

  if (stats.enemEligibleBySubject['Português'] !== 2) {
    throw new Error(
      `ENEM elegível para Português inválido: ${stats.enemEligibleBySubject['Português']}`
    );
  }

  if (stats.enemEligibleBySubject['Ciências Humanas'] !== 8) {
    throw new Error(
      `ENEM elegível para Ciências Humanas inválido: ${stats.enemEligibleBySubject['Ciências Humanas']}`
    );
  }

  const portugueseSession = getQuestionsForLesson({
    subject: 'Português',
    amount: 5,
  });
  const humanasSession = getQuestionsForLesson({
    subject: 'Ciências Humanas',
    amount: 5,
  });

  const portugueseEnemCount = portugueseSession.filter(isEnemQuestion).length;
  const humanasEnemCount = humanasSession.filter(isEnemQuestion).length;

  if (portugueseEnemCount < 1) {
    throw new Error(
      `Seleção real de Português (amount=5) sem ENEM: ${portugueseEnemCount}`
    );
  }

  if (humanasEnemCount < 1) {
    throw new Error(
      `Seleção real de Ciências Humanas (amount=5) sem ENEM: ${humanasEnemCount}`
    );
  }

  const hasPortugueseEnem = portugueseSession.some(isEnemQuestion);
  const hasHumanasEnem = humanasSession.some(isEnemQuestion);

  if (!hasPortugueseEnem) {
    throw new Error(
      'Seleção de sessão não retorna questão ENEM para Português'
    );
  }

  if (!hasHumanasEnem) {
    throw new Error(
      'Seleção de sessão não retorna questão ENEM para Ciências Humanas'
    );
  }

  const sample = portugueseSession.find(isEnemQuestion) ?? humanasSession[0];

  if (
    !sample?.externalId ||
    !sample.source ||
    !sample.year ||
    !sample.area ||
    !sample.subject ||
    !sample.question
  ) {
    throw new Error('Questão ENEM selecionada sem metadados completos');
  }
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  assertEnemQuestionBankIntegration();
}