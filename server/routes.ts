import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerImageRoutes } from "./replit_integrations/image";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerAudioRoutes(app);
  registerImageRoutes(app);

  // Authentication middleware to protect routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Study Plans
  app.get(api.studyPlans.list.path, requireAuth, async (req: any, res) => {
    const plans = await storage.getStudyPlans(req.user.claims.sub);
    res.json(plans);
  });

  app.get(api.studyPlans.get.path, requireAuth, async (req: any, res) => {
    const plan = await storage.getStudyPlan(Number(req.params.id));
    if (!plan || plan.userId !== req.user.claims.sub) {
      return res.status(404).json({ message: "Study plan not found" });
    }
    res.json(plan);
  });

  app.post(api.studyPlans.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.studyPlans.create.input.parse(req.body);
      
      // Use AI to generate a study plan
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: "You are an expert study planner. Generate a detailed, structured study plan for the given subject leading up to the given exam date." },
          { role: "user", content: `Subject: ${input.subject}\nExam Date: ${input.examDate}` }
        ]
      });
      
      const planContent = response.choices[0]?.message?.content || "Study plan generation failed.";

      const plan = await storage.createStudyPlan({
        userId: req.user.claims.sub,
        subject: input.subject,
        examDate: input.examDate,
        planContent
      });
      
      res.status(201).json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quizzes
  app.get(api.quizzes.list.path, requireAuth, async (req: any, res) => {
    const quizzes = await storage.getQuizzes(req.user.claims.sub);
    res.json(quizzes);
  });

  app.get(api.quizzes.get.path, requireAuth, async (req: any, res) => {
    const quiz = await storage.getQuizWithQuestions(Number(req.params.id));
    if (!quiz || quiz.userId !== req.user.claims.sub) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  });

  app.post(api.quizzes.generate.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.quizzes.generate.input.parse(req.body);
      
      // Use AI to generate 5 multiple choice questions
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { 
            role: "system", 
            content: `You are an expert quiz generator. Generate 5 multiple choice questions for the specified subject and topic.
                      Return the result as a strict JSON object with this exact schema:
                      {
                        "questions": [
                          {
                            "text": "The question text",
                            "options": ["A", "B", "C", "D"],
                            "correctAnswer": "A"
                          }
                        ]
                      }
                      Do not include markdown blocks or any other text.` 
          },
          { role: "user", content: `Subject: ${input.subject}\nTopic: ${input.topic}\nDifficulty: ${input.difficulty || "medium"}` }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content || "{}";
      const generatedData = JSON.parse(content);
      
      if (!generatedData.questions || !Array.isArray(generatedData.questions)) {
        throw new Error("Invalid format returned by AI");
      }

      const quiz = await storage.createQuizWithQuestions(
        {
          userId: req.user.claims.sub,
          subject: input.subject,
          topic: input.topic,
          score: null,
          totalQuestions: generatedData.questions.length,
        },
        generatedData.questions
      );
      
      res.status(201).json(quiz);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.quizzes.submit.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.quizzes.submit.input.parse(req.body);
      const quizId = Number(req.params.id);
      
      const quiz = await storage.getQuizWithQuestions(quizId);
      if (!quiz || quiz.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      let score = 0;
      const userAnswers: { questionId: number, answer: string }[] = [];
      const weakTopics = new Set<string>();

      for (const question of quiz.questions) {
        const userAnswer = input.answers[question.id.toString()];
        if (userAnswer) {
          userAnswers.push({ questionId: question.id, answer: userAnswer });
          if (userAnswer === question.correctAnswer) {
            score++;
          } else {
            weakTopics.add(quiz.topic);
          }
        }
      }

      await storage.submitQuiz(quizId, score, quiz.questions.length, userAnswers);

      res.json({
        score,
        totalQuestions: quiz.questions.length,
        weakTopics: Array.from(weakTopics),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Results Dashboard
  app.get(api.results.get.path, requireAuth, async (req: any, res) => {
    const quizzes = await storage.getQuizzes(req.user.claims.sub);
    const completedQuizzes = quizzes.filter(q => q.score !== null);
    
    let totalScore = 0;
    let totalPossible = 0;
    const weakTopicsMap = new Map<string, { correct: number, total: number }>();
    
    for (const quiz of completedQuizzes) {
      totalScore += (quiz.score || 0);
      totalPossible += (quiz.totalQuestions || 0);
      
      const current = weakTopicsMap.get(quiz.topic) || { correct: 0, total: 0 };
      weakTopicsMap.set(quiz.topic, {
        correct: current.correct + (quiz.score || 0),
        total: current.total + (quiz.totalQuestions || 0)
      });
    }
    
    const weakTopics = Array.from(weakTopicsMap.entries())
      .filter(([_, stats]) => stats.total > 0 && (stats.correct / stats.total) < 0.7)
      .map(([topic]) => topic);
      
    const averageScore = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
    
    res.json({
      quizzes: completedQuizzes,
      weakTopics,
      averageScore,
    });
  });

  return httpServer;
}
