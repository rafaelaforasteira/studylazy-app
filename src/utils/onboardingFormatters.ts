export function getDailyGoalMinutes(dailyGoal: string | null) {
  switch (dailyGoal) {
    case '5min':
      return 5;
    case '10min':
      return 10;
    case '15min':
      return 15;
    case '20min':
      return 20;
    default:
      return 20;
  }
}

export function getGoalLabel(goal: string | null) {
  switch (goal) {
    case 'treinar':
      return 'Treinar';
    case 'faculdade':
      return 'Entrar na faculdade';
    case 'diversao':
      return 'Diversão';
    default:
      return 'Estudar melhor';
  }
}

export function getPreparationLabel(preparationLevel: string | null) {
  switch (preparationLevel) {
    case 'nada-preparado':
      return 'Começando do zero';
    case 'estudo-casa':
      return 'Estuda em casa';
    case 'cursinho':
      return 'Faz cursinho';
    default:
      return 'Perfil em construção';
  }
}

export function getNextStudyDuration(dailyGoal: string | null) {
  const minutes = getDailyGoalMinutes(dailyGoal);

  if (minutes <= 5) return 5;
  if (minutes <= 10) return 10;

  return 15;
}