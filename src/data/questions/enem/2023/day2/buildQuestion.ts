import type {
  Question,
  QuestionContentBlock,
  QuestionContentFormat,
} from '../../../../questionTypes';

const ENEM_AREA_TO_SUBJECT: Record<string, string> = {
  natural_sciences: 'Ciências da Natureza',
  mathematics: 'Matemática',
};

const ENEM_AREA_LABEL: Record<string, string> = {
  natural_sciences: 'Ciências da Natureza',
  mathematics: 'Matemática',
};

function formatOption(id: string, text: string) {
  return `${id}) ${text}`;
}

function buildEditorialExplanation(params: {
  prompt: string;
  correctLetter: string;
  correctText: string;
  area: 'natural_sciences' | 'mathematics';
}) {
  if (params.area === 'mathematics') {
    return `A alternativa ${params.correctLetter} é a correta. O raciocínio parte dos dados do enunciado e conduz à conclusão "${params.correctText}", que atende ao comando: ${params.prompt}`;
  }

  return `A alternativa ${params.correctLetter} é a correta porque responde ao comando com base no texto-base e nas relações apresentadas. A opção "${params.correctText}" está alinhada à pergunta: ${params.prompt}`;
}

export function buildEnem2023Day2Question(params: {
  externalId: string;
  questionNumber: number;
  area: 'natural_sciences' | 'mathematics';
  topic: string;
  prompt: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  contentBlocks?: QuestionContentBlock[];
  contentFormat?: QuestionContentFormat;
  options: { id: string; text: string }[];
  correctAnswerId: string;
  verified: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}): Question {
  const options = params.options.map((option) =>
    formatOption(option.id, option.text)
  );

  const correctOption = params.options.find(
    (option) => option.id === params.correctAnswerId
  );

  if (!correctOption) {
    throw new Error(`Gabarito inválido para ${params.externalId}`);
  }

  const areaLabel = ENEM_AREA_LABEL[params.area];

  return {
    id: params.externalId,
    externalId: params.externalId,
    originType: 'official_exam',
    sourceVerified: true,
    officialStatus: 'valid',
    eligibleForScoredSessions: true,
    verified: params.verified,
    source: 'ENEM 2023',
    year: 2023,
    examDay: 2,
    booklet: 'Caderno 5 — Amarelo',
    questionNumber: params.questionNumber,
    languageTrack: null,
    area: areaLabel,
    topic: params.topic,
    subject: ENEM_AREA_TO_SUBJECT[params.area],
    difficulty: params.difficulty ?? 'medium',
    question: params.prompt,
    prompt: params.prompt,
    supportTitle: params.supportTitle,
    supportText: params.supportText,
    sourceCitation: params.sourceCitation,
    contentBlocks: params.contentBlocks,
    contentFormat: params.contentFormat ?? 'prose',
    options,
    correctAnswer: formatOption(correctOption.id, correctOption.text),
    explanation: buildEditorialExplanation({
      prompt: params.prompt,
      correctLetter: correctOption.id,
      correctText: correctOption.text,
      area: params.area,
    }),
    explanationOrigin: 'editorial',
    explanationVerified: false,
    requiresImage: false,
    requiresMedia: false,
  };
}
