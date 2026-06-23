export type Question = {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  externalId?: string;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
  requiresImage?: boolean;
};
