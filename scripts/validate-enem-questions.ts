import { allEnem2024Questions } from '../src/data/enem2024Questions';
import { validateEnemQuestionBank } from '../src/data/validateEnemQuestions';

validateEnemQuestionBank(allEnem2024Questions);

console.log(
  `ENEM 2024: ${allEnem2024Questions.length} questões validadas com sucesso.`
);
