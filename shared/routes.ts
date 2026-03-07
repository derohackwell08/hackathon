import { z } from 'zod';
import { insertQuizSchema, insertQuestionSchema, insertStudyPlanSchema, quizzes, questions, studyPlans } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  studyPlans: {
    list: {
      method: 'GET' as const,
      path: '/api/study-plans' as const,
      responses: {
        200: z.array(z.custom<typeof studyPlans.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/study-plans/:id' as const,
      responses: {
        200: z.custom<typeof studyPlans.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/study-plans' as const,
      input: z.object({
        subject: z.string(),
        examDate: z.string(),
      }),
      responses: {
        201: z.custom<typeof studyPlans.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  quizzes: {
    list: {
      method: 'GET' as const,
      path: '/api/quizzes' as const,
      responses: {
        200: z.array(z.custom<typeof quizzes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/quizzes/:id' as const,
      responses: {
        200: z.custom<typeof quizzes.$inferSelect>().and(
          z.object({ questions: z.array(z.custom<typeof questions.$inferSelect>()) })
        ),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/quizzes/generate' as const,
      input: z.object({
        subject: z.string(),
        topic: z.string(),
        difficulty: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof quizzes.$inferSelect>().and(
          z.object({ questions: z.array(z.custom<typeof questions.$inferSelect>()) })
        ),
        400: errorSchemas.validation,
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/quizzes/:id/submit' as const,
      input: z.object({
        answers: z.record(z.string(), z.string()), // questionId -> answer
      }),
      responses: {
        200: z.object({
          score: z.number(),
          totalQuestions: z.number(),
          weakTopics: z.array(z.string()),
        }),
      },
    },
  },
  results: {
    get: {
      method: 'GET' as const,
      path: '/api/results' as const,
      responses: {
        200: z.object({
          quizzes: z.array(z.custom<typeof quizzes.$inferSelect>()),
          weakTopics: z.array(z.string()),
          averageScore: z.number(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type StudyPlanResponse = z.infer<typeof api.studyPlans.create.responses[201]>;
export type QuizResponse = z.infer<typeof api.quizzes.generate.responses[201]>;
export type QuizListResponse = z.infer<typeof api.quizzes.list.responses[200]>;
export type ResultsResponse = z.infer<typeof api.results.get.responses[200]>;
