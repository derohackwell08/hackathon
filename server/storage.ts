import {
  users,
  quizzes,
  questions,
  studyPlans,
  type User,
  type Quiz,
  type Question,
  type StudyPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Quizzes
  getQuizzes(userId: string): Promise<Quiz[]>;
  getQuizWithQuestions(id: number): Promise<(Quiz & { questions: Question[] }) | undefined>;
  createQuizWithQuestions(
    quizData: Omit<typeof quizzes.$inferInsert, "id" | "createdAt">,
    questionsData: Omit<typeof questions.$inferInsert, "id" | "quizId">[]
  ): Promise<Quiz & { questions: Question[] }>;
  submitQuiz(quizId: number, score: number, totalQuestions: number, userAnswers: { questionId: number, answer: string }[]): Promise<void>;

  // Study Plans
  getStudyPlans(userId: string): Promise<StudyPlan[]>;
  getStudyPlan(id: number): Promise<StudyPlan | undefined>;
  createStudyPlan(plan: Omit<typeof studyPlans.$inferInsert, "id" | "createdAt">): Promise<StudyPlan>;
}

export class DatabaseStorage implements IStorage {
  async getQuizzes(userId: string): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.userId, userId)).orderBy(desc(quizzes.createdAt));
  }

  async getQuizWithQuestions(id: number): Promise<(Quiz & { questions: Question[] }) | undefined> {
    const quizRows = await db.select().from(quizzes).where(eq(quizzes.id, id));
    if (!quizRows.length) return undefined;
    
    const quiz = quizRows[0];
    const questionRows = await db.select().from(questions).where(eq(questions.quizId, id));
    
    return { ...quiz, questions: questionRows };
  }

  async createQuizWithQuestions(
    quizData: Omit<typeof quizzes.$inferInsert, "id" | "createdAt">,
    questionsData: Omit<typeof questions.$inferInsert, "id" | "quizId">[]
  ): Promise<Quiz & { questions: Question[] }> {
    const [quiz] = await db.insert(quizzes).values(quizData).returning();
    
    const questionsToInsert = questionsData.map((q) => ({
      ...q,
      quizId: quiz.id,
    }));
    
    const insertedQuestions = await db.insert(questions).values(questionsToInsert).returning();
    
    return { ...quiz, questions: insertedQuestions };
  }

  async submitQuiz(quizId: number, score: number, totalQuestions: number, userAnswers: { questionId: number, answer: string }[]): Promise<void> {
    await db.update(quizzes).set({ score, totalQuestions }).where(eq(quizzes.id, quizId));
    
    for (const ans of userAnswers) {
      await db.update(questions)
        .set({ userAnswer: ans.answer })
        .where(eq(questions.id, ans.questionId));
    }
  }

  async getStudyPlans(userId: string): Promise<StudyPlan[]> {
    return await db.select().from(studyPlans).where(eq(studyPlans.userId, userId)).orderBy(desc(studyPlans.createdAt));
  }

  async getStudyPlan(id: number): Promise<StudyPlan | undefined> {
    const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.id, id));
    return plan;
  }

  async createStudyPlan(plan: Omit<typeof studyPlans.$inferInsert, "id" | "createdAt">): Promise<StudyPlan> {
    const [newPlan] = await db.insert(studyPlans).values(plan).returning();
    return newPlan;
  }
}

export const storage = new DatabaseStorage();
