import { useQuery } from "@tanstack/react-query";
import { api, type ResultsResponse } from "@shared/routes";

export function useResults() {
  return useQuery({
    queryKey: [api.results.get.path],
    queryFn: async () => {
      const res = await fetch(api.results.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch results");
      return await res.json() as ResultsResponse;
    },
  });
}
