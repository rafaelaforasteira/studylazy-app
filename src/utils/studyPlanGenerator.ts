import { getDailyGoalMinutes } from './onboardingFormatters';

export type StudyTask = {
  subject: string;
  duration: number;
  type: string;
};

type GenerateTodayPlanParams = {
  dailyGoal: string | null;
  goal: string | null;
  preparationLevel: string | null;
};

export function generateTodayPlan({
  dailyGoal,
  goal,
  preparationLevel,
}: GenerateTodayPlanParams): StudyTask[] {
  const totalMinutes = getDailyGoalMinutes(dailyGoal);

  if (totalMinutes <= 5) {
    return [
      {
        subject: 'Português',
        duration: 5,
        type: getTaskType(preparationLevel),
      },
    ];
  }

  if (totalMinutes <= 10) {
    return [
      {
        subject: 'Português',
        duration: 5,
        type: getTaskType(preparationLevel),
      },
      {
        subject: 'Matemática',
        duration: 5,
        type: 'Exercícios',
      },
    ];
  }

  if (totalMinutes <= 15) {
    return [
      {
        subject: 'Português',
        duration: 5,
        type: getTaskType(preparationLevel),
      },
      {
        subject: 'Matemática',
        duration: 5,
        type: 'Exercícios',
      },
      {
        subject: getThirdSubject(goal),
        duration: 5,
        type: 'Revisão',
      },
    ];
  }

  return [
    {
      subject: 'Português',
      duration: 7,
      type: getTaskType(preparationLevel),
    },
    {
      subject: 'Matemática',
      duration: 7,
      type: 'Exercícios',
    },
    {
      subject: getThirdSubject(goal),
      duration: 6,
      type: 'Revisão',
    },
  ];
}

export function getNextTask(
  tasks: StudyTask[],
  completedTasksToday: string[] = []
) {
  const nextTask = tasks.find(
    (task) => !completedTasksToday.includes(task.subject)
  );

  return nextTask || tasks[0];
}

function getTaskType(preparationLevel: string | null) {
  switch (preparationLevel) {
    case 'nada-preparado':
      return 'Fundamentos';
    case 'estudo-casa':
      return 'Teoria';
    case 'cursinho':
      return 'Revisão';
    default:
      return 'Teoria';
  }
}

function getThirdSubject(goal: string | null) {
  switch (goal) {
    case 'faculdade':
      return 'Redação';
    case 'treinar':
      return 'Questões';
    case 'diversao':
      return 'Desafio rápido';
    default:
      return 'Redação';
  }
}