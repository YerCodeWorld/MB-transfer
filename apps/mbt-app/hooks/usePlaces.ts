import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/api";

// Query keys factory
export const placeKeys = {
  all: ["places"] as const,
  lists: () => [...placeKeys.all, "list"] as const,
  list: (params?: any) => [...placeKeys.lists(), params] as const,
  details: () => [...placeKeys.all, "detail"] as const,
  detail: (id: string) => [...placeKeys.details(), id] as const,
};

// Query hooks
export function usePlaces(params?: {
  kind?: string;
  zoneId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: placeKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getPlaces(params);
      return response.data || [];
    },
  });
}

export function usePlace(id: string) {
  return useQuery({
    queryKey: placeKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getPlace(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createPlace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
    },
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updatePlace(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: placeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
    },
  });
}
