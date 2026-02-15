import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/api";

// Query keys factory
export const routeKeys = {
  all: ["routes"] as const,
  lists: () => [...routeKeys.all, "list"] as const,
  list: (params?: any) => [...routeKeys.lists(), params] as const,
  details: () => [...routeKeys.all, "detail"] as const,
  detail: (id: string) => [...routeKeys.details(), id] as const,
};

// Query hooks
export function useRoutes(params?: {
  fromId?: string;
  toId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: routeKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getRoutes(params);
      return response.data || [];
    },
  });
}

export function useRoute(id: string) {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getRoute(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateRoute(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: routeKeys.lists() });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });
}
