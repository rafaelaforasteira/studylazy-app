import { foreignLanguageQuestions } from './foreignLanguages';
import { humanSciencesQuestions } from './humanSciences';
import { languageQuestions } from './languages';

export { buildEnem2023Question } from './buildQuestion';
export { foreignLanguageQuestions } from './foreignLanguages';
export { languageQuestions } from './languages';
export { humanSciencesQuestions } from './humanSciences';

export const enem2023Day1TextQuestions = [
  ...foreignLanguageQuestions,
  ...languageQuestions,
  ...humanSciencesQuestions,
];

export const enem2023Day1VerifiedQuestions = enem2023Day1TextQuestions.filter(
  (question) => question.verified
);

export const enem2023Day1StagingQuestions = enem2023Day1TextQuestions.filter(
  (question) => !question.verified
);
