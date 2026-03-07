import { pgTable, serial, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { conversations, messages } from "./models/chat";

export { users, conversations, messages };

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  text: text("text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  userAnswer: text("user_answer"),
});

export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  examDate: text("exam_date").notNull(),
  planContent: text("plan_content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
}));

export const questionRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));

export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertStudyPlanSchema = createInsertSchema(studyPlans).omit({ id: true, createdAt: true });

export type Quiz = typeof quizzes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type QuizResponse = Quiz & { questions: Question[] };
