import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type QuestionReportCategory =
  | 'wrong_answer'
  | 'incomplete_statement'
  | 'alternative_error'
  | 'missing_content'
  | 'other';

export type QuestionReportStatus = 'pending' | 'synced';

export type QuestionReportContext = 'study' | 'review';

export type QuestionReport = {
  id: string;
  questionId: string;
  subject: string;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
  context: QuestionReportContext;
  category: QuestionReportCategory;
  description?: string;
  status: QuestionReportStatus;
  createdAt: string;
  questionSnapshot: {
    statement: string;
    options: string[];
    correctAnswer: string;
  };
};

export type AddQuestionReportInput = {
  questionId: string;
  subject: string;
  source?: string;
  year?: number;
  area?: string;
  topic?: string;
  context: QuestionReportContext;
  category: QuestionReportCategory;
  description?: string;
  questionSnapshot: QuestionReport['questionSnapshot'];
};

type QuestionReportStore = {
  reports: QuestionReport[];

  addReport: (input: AddQuestionReportInput) => QuestionReport;
  removeReport: (id: string) => void;
  clearReports: () => void;
  markReportAsSynced: (id: string) => void;
  getPendingReports: () => QuestionReport[];
};

function createReportId() {
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildReport(input: AddQuestionReportInput): QuestionReport {
  const report: QuestionReport = {
    id: createReportId(),
    questionId: input.questionId,
    subject: input.subject,
    context: input.context,
    category: input.category,
    status: 'pending',
    createdAt: new Date().toISOString(),
    questionSnapshot: {
      statement: input.questionSnapshot.statement,
      options: [...input.questionSnapshot.options],
      correctAnswer: input.questionSnapshot.correctAnswer,
    },
  };

  if (input.source) {
    report.source = input.source;
  }

  if (input.year !== undefined) {
    report.year = input.year;
  }

  if (input.area) {
    report.area = input.area;
  }

  if (input.topic) {
    report.topic = input.topic;
  }

  const description = input.description?.trim();

  if (description) {
    report.description = description;
  }

  return report;
}

export const useQuestionReportStore = create<QuestionReportStore>()(
  persist(
    (set, get) => ({
      reports: [],

      addReport: (input) => {
        const report = buildReport(input);

        set((state) => ({
          reports: [report, ...state.reports],
        }));

        return report;
      },

      removeReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((report) => report.id !== id),
        })),

      clearReports: () =>
        set({
          reports: [],
        }),

      markReportAsSynced: (id) =>
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === id
              ? { ...report, status: 'synced' as const }
              : report
          ),
        })),

      getPendingReports: () =>
        get().reports.filter((report) => report.status === 'pending'),
    }),
    {
      name: 'studylazy-question-reports',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
