import { useQuery } from "@tanstack/react-query";
import { apiClient, DeveloperNote } from "@/utils/api";

export const developerNoteKeys = {
  all: ["developer-notes"] as const,
  lists: () => [...developerNoteKeys.all, "list"] as const,
  list: (params?: any) => [...developerNoteKeys.lists(), params] as const,
};

export function useDeveloperNotes(params?: {
  active?: boolean;
  type?: "PATCH" | "UPDATE" | "WARNING" | "INFO";
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: developerNoteKeys.list(params),
    queryFn: async (): Promise<DeveloperNote[]> => {
      const response = await apiClient.getDeveloperNotes(params);
      return response.data || [];
    },
    refetchInterval: 60_000,
  });
}
