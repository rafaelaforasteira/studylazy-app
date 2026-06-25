import { naturalSciencesQuestions } from './naturalSciences';
import { mathematicsQuestions } from './mathematics';

export { buildEnem2023Day2Question } from './buildQuestion';
export { enem2023Day2AnnulledRegistry } from './annulledRegistry';
export { naturalSciencesQuestions } from './naturalSciences';
export { mathematicsQuestions } from './mathematics';

export const enem2023Day2TextQuestions = [
  ...naturalSciencesQuestions,
  ...mathematicsQuestions,
];

export const enem2023Day2VerifiedQuestions = enem2023Day2TextQuestions.filter(
  (question) => question.verified
);

export const enem2023Day2StagingQuestions = enem2023Day2TextQuestions.filter(
  (question) => !question.verified
);
