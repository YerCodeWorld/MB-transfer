import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/api";

// Query keys factory
export const zoneKeys = {
  all: ["zones"] as const,
  lists: () => [...zoneKeys.all, "list"] as const,
  list: (params?: any) => [...zoneKeys.lists(), params] as const,
  details: () => [...zoneKeys.all, "detail"] as const,
  detail: (id: string) => [...zoneKeys.details(), id] as const,
};

// Query hooks
export function useZones(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: zoneKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getZones(params);
      return response.data || [];
    },
  });
}

export function useZone(id: string) {
  return useQuery({
    queryKey: zoneKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getZone(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateZone(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
    },
  });
}

export function useAddZonePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: { vehicleId: string; price: string };
    }) => apiClient.addZonePrice(zoneId, data),
    onSuccess: (_, { zoneId }) => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
  });
}

export function useDeleteZonePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, vehicleId }: { zoneId: string; vehicleId: string }) =>
      apiClient.deleteZonePrice(zoneId, vehicleId),
    onSuccess: (_, { zoneId }) => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
  });
}
