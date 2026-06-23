import {
  enem2024HumanasQuestions,
  enem2024LinguagensQuestions,
} from './enem2024Questions';
import type { Question } from './questionTypes';

export type { Question } from './questionTypes';

type GetQuestionsForLessonParams = {
  subject: string;
  amount: number;
};

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

export function findQuestionByStatement(statement: string) {
  return getAllQuestions().find((question) => question.question === statement);
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
}: GetQuestionsForLessonParams) {
  const questionBank = getQuestionBankBySubject(subject);

  const questions: Question[] = [];

  for (let i = 0; i < amount; i++) {
    questions.push(questionBank[i % questionBank.length]);
  }

  return questions;
}