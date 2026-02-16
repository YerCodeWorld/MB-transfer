import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/api";

export const allyKeys = {
  all: ["allies"] as const,
  lists: () => [...allyKeys.all, "list"] as const,
  list: (params?: any) => [...allyKeys.lists(), params] as const,
  details: () => [...allyKeys.all, "detail"] as const,
  detail: (id: string) => [...allyKeys.details(), id] as const,
};

export function useAllies(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: allyKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getAllies(params);
      return response.data || [];
    },
  });
}

export function useAlly(id: string) {
  return useQuery({
    queryKey: allyKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getAlly(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateAlly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createAlly(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allyKeys.lists() });
    },
  });
}

export function useUpdateAlly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateAlly(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: allyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: allyKeys.lists() });
    },
  });
}

export function useDeleteAlly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAlly(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allyKeys.all });
    },
  });
}
