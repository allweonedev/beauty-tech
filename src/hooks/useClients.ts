import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/apiFetch";
import type { Client } from "@/types/client";

// Extended Client interface with optimistic flag
interface OptimisticClient extends Client {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

// Type definitions for paginated data
interface PageData {
  data: OptimisticClient[];
  nextPage?: number;
  previousPage?: number;
  hasNextPage: boolean;
}

interface PaginatedQueryData {
  pages: PageData[];
  pageParams: number[];
}

// Query key for clients
export const clientsQueryKey: QueryKey = ["clients"];

// Base hook for getting clients (maintains old behavior)
export function useClients() {
  return useQuery({
    queryKey: clientsQueryKey,
    queryFn: async () => {
      const result = await api.get("/api/clients");
      return (Array.isArray(result)
        ? result
        : []) as unknown as OptimisticClient[];
    },
  });
}

// Hook for getting paginated clients
export function usePaginatedClients(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: [...clientsQueryKey, "paginated"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await api.get("/api/clients", {
        query: {
          page: Number(pageParam),
          limit: pageSize,
        },
      });

      // Parse response to an array of clients
      const clients = Array.isArray(response) ? response : [];

      // If we receive fewer items than the page size, we know there are no more pages
      const hasNextPage = clients.length === pageSize;

      return {
        data: clients,
        nextPage: hasNextPage ? Number(pageParam) + 1 : undefined,
        previousPage: Number(pageParam) > 0 ? Number(pageParam) - 1 : undefined,
        hasNextPage,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

// Hook for creating a client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newClient: Partial<Client>) =>
      api.post("/api/clients", newClient),

    // Optimistic update for client creation
    onMutate: async (newClient) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: clientsQueryKey });

      // Snapshot the previous value
      const previousClients =
        queryClient.getQueryData<OptimisticClient[]>(clientsQueryKey) ?? [];

      // Optimistically add the new client to the list
      const optimisticClient: OptimisticClient = {
        id: crypto.randomUUID(), // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: [],
        notes: [],
        interactions: [],
        source: newClient.source ?? "manual",
        ...newClient,
        isOptimistic: true,
        optimisticOperation: "create",
      } as OptimisticClient;

      queryClient.setQueryData(clientsQueryKey, [
        ...previousClients,
        optimisticClient,
      ]);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...clientsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedQueryData>(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(
          paginatedQueryKey,
          (old: PaginatedQueryData | undefined) => {
            if (!old) return old;

            // Add to the most recent page
            const pagesData = [...old.pages];
            const latestPage = { ...pagesData[pagesData.length - 1] };

            latestPage.data = [...latestPage.data, optimisticClient];
            pagesData[pagesData.length - 1] = latestPage;

            return {
              ...old,
              pages: pagesData,
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousClients, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newClient, context) => {
      if (context) {
        queryClient.setQueryData(clientsQueryKey, context.previousClients);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...clientsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the clients query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...clientsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for updating a client
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      api.put("/api/clients", data, { query: { id } }),

    // Optimistic update for client update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: clientsQueryKey });

      // Snapshot the previous value
      const previousClients =
        queryClient.getQueryData<OptimisticClient[]>(clientsQueryKey) ?? [];

      // Optimistically update the client in the list
      const updatedClients = previousClients.map((client: OptimisticClient) =>
        client.id === id
          ? {
              ...client,
              ...data,
              updatedAt: new Date(),
              isOptimistic: true,
              optimisticOperation: "update",
            }
          : client
      );

      queryClient.setQueryData(clientsQueryKey, updatedClients);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...clientsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedQueryData>(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(
          paginatedQueryKey,
          (old: PaginatedQueryData | undefined) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: PageData) => ({
                ...page,
                data: page.data.map((client: OptimisticClient) =>
                  client.id === id
                    ? {
                        ...client,
                        ...data,
                        updatedAt: new Date(),
                        isOptimistic: true,
                        optimisticOperation: "update",
                      }
                    : client
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousClients, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(clientsQueryKey, context.previousClients);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...clientsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the clients query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...clientsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for deleting a client
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete("/api/clients", undefined, { query: { id } }),

    // Optimistic update for client deletion
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: clientsQueryKey });

      // Snapshot the previous value
      const previousClients =
        queryClient.getQueryData<OptimisticClient[]>(clientsQueryKey) ?? [];

      // Mark client as being deleted but don't remove it yet (visual feedback)
      const updatedClients = previousClients.map((client: OptimisticClient) =>
        client.id === id
          ? { ...client, isOptimistic: true, optimisticOperation: "delete" }
          : client
      );

      queryClient.setQueryData(clientsQueryKey, updatedClients);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...clientsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedQueryData>(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(
          paginatedQueryKey,
          (old: PaginatedQueryData | undefined) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: PageData) => ({
                ...page,
                data: page.data.map((client: OptimisticClient) =>
                  client.id === id
                    ? {
                        ...client,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : client
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousClients, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      if (context) {
        queryClient.setQueryData(clientsQueryKey, context.previousClients);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...clientsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the clients query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...clientsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for bulk deleting clients
export function useBulkDeleteClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => api.post("/api/clients/bulk", { ids }),

    // Optimistic update for bulk client deletion
    onMutate: async (clientIds) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: clientsQueryKey });

      // Snapshot the previous value
      const previousClients =
        queryClient.getQueryData<OptimisticClient[]>(clientsQueryKey) ?? [];

      // No need to check if previousClients is null/undefined as we provide a default above

      // Mark clients as being deleted with visual indication
      const updatedClients = previousClients.map((client: OptimisticClient) =>
        clientIds.includes(client.id)
          ? { ...client, isOptimistic: true, optimisticOperation: "delete" }
          : client
      );

      // Apply the optimistic update
      queryClient.setQueryData(clientsQueryKey, updatedClients);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...clientsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedQueryData>(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(
          paginatedQueryKey,
          (old: PaginatedQueryData | undefined) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: PageData) => ({
                ...page,
                data: page.data.map((client: OptimisticClient) =>
                  clientIds.includes(client.id)
                    ? {
                        ...client,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : client
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousClients, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, clientIds, context) => {
      if (context) {
        queryClient.setQueryData(clientsQueryKey, context.previousClients);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...clientsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the clients query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...clientsQueryKey, "paginated"],
      });
    },
  });
}
