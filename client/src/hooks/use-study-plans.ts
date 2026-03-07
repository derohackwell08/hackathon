import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type StudyPlanResponse } from "@shared/routes";

export function useStudyPlans() {
  return useQuery({
    queryKey: [api.studyPlans.list.path],
    queryFn: async () => {
      const res = await fetch(api.studyPlans.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch study plans");
      return await res.json();
    },
  });
}

export function useCreateStudyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject: string; examDate: string }) => {
      const res = await fetch(api.studyPlans.create.path, {
        method: api.studyPlans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create study plan");
      }
      return await res.json() as StudyPlanResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.studyPlans.list.path] });
    },
  });
}
