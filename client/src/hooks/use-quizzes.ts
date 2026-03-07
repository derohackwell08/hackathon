import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type QuizResponse, type QuizListResponse } from "@shared/routes";

function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useQuizzes() {
  return useQuery({
    queryKey: [api.quizzes.list.path],
    queryFn: async () => {
      const res = await fetch(api.quizzes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      const data = await res.json();
      return parseWithLogging<QuizListResponse>(api.quizzes.list.responses[200], data, "quizzes.list");
    },
  });
}

export function useQuiz(id: number) {
  return useQuery({
    queryKey: [api.quizzes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.quizzes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch quiz");
      const data = await res.json();
      return parseWithLogging<QuizResponse>(api.quizzes.get.responses[200], data, "quizzes.get");
    },
    enabled: !!id,
  });
}

export function useGenerateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject: string; topic: string; difficulty?: string }) => {
      const res = await fetch(api.quizzes.generate.path, {
        method: api.quizzes.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to generate quiz");
      }
      const data = await res.json();
      return parseWithLogging<QuizResponse>(api.quizzes.generate.responses[201], data, "quizzes.generate");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quizzes.list.path] });
    },
  });
}

export function useSubmitQuiz(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (answers: Record<string, string>) => {
      const url = buildUrl(api.quizzes.submit.path, { id });
      const res = await fetch(url, {
        method: api.quizzes.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quizzes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.results.get.path] });
    },
  });
}
