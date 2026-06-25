import type {
  Question,
  QuestionContentFormat,
  QuestionLanguageTrack,
} from '../../../../questionTypes';

const ENEM_AREA_TO_SUBJECT: Record<string, string> = {
  languages: 'Português',
  human_sciences: 'Ciências Humanas',
  Linguagens: 'Português',
  'Ciências Humanas': 'Ciências Humanas',
};

const ENEM_AREA_LABEL: Record<string, string> = {
  languages: 'Linguagens',
  human_sciences: 'Ciências Humanas',
};

function formatOption(id: string, text: string) {
  return `${id}) ${text}`;
}

function resolveSubject(area: string, languageTrack: QuestionLanguageTrack) {
  if (languageTrack === 'english') {
    return 'Inglês';
  }
  if (languageTrack === 'spanish') {
    return 'Espanhol';
  }
  return ENEM_AREA_TO_SUBJECT[area] ?? area;
}

function resolveAreaLabel(area: string) {
  return ENEM_AREA_LABEL[area] ?? area;
}

function buildEditorialExplanation(params: {
  externalId: string;
  prompt: string;
  correctLetter: string;
  correctText: string;
}) {
  return `A alternativa ${params.correctLetter} é a correta porque responde ao comando do enunciado com base no texto-base apresentado. O trecho sustenta "${params.correctText.slice(0, 80)}${params.correctText.length > 80 ? '…' : ''}", o que atende à pergunta: ${params.prompt}`;
}

export function buildEnem2023Question(params: {
  externalId: string;
  questionNumber: number;
  languageTrack: QuestionLanguageTrack;
  area: 'languages' | 'human_sciences';
  topic: string;
  prompt: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  contentFormat?: QuestionContentFormat;
  options: { id: string; text: string }[];
  correctAnswerId: string;
  verified: boolean;
  verificationNote?: string;
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

  const areaLabel = resolveAreaLabel(params.area);

  return {
    id: params.externalId,
    externalId: params.externalId,
    originType: 'official_exam',
    sourceVerified: true,
    verified: params.verified,
    source: 'ENEM 2023',
    year: 2023,
    examDay: 1,
    booklet: 'Caderno 1 — Azul',
    questionNumber: params.questionNumber,
    languageTrack: params.languageTrack,
    area: areaLabel,
    topic: params.topic,
    subject: resolveSubject(params.area, params.languageTrack),
    difficulty: params.difficulty ?? 'medium',
    question: params.prompt,
    prompt: params.prompt,
    supportTitle: params.supportTitle,
    supportText: params.supportText,
    sourceCitation: params.sourceCitation,
    contentFormat: params.contentFormat ?? 'prose',
    options,
    correctAnswer: formatOption(correctOption.id, correctOption.text),
    explanation: buildEditorialExplanation({
      externalId: params.externalId,
      prompt: params.prompt,
      correctLetter: correctOption.id,
      correctText: correctOption.text,
    }),
    explanationOrigin: 'editorial',
    explanationVerified: false,
    requiresImage: false,
    requiresMedia: false,
  };
}
