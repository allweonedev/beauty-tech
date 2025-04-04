import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/apiFetch";
import type { ServiceOrder } from "@/components/service-order/ServiceOrderModal";

// Extended ServiceOrder interface with optimistic flag
interface OptimisticServiceOrder extends ServiceOrder {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

// Type definitions for paginated data
interface PageData {
  data: OptimisticServiceOrder[];
  nextPage?: number;
  previousPage?: number;
  hasNextPage: boolean;
}

interface PaginatedQueryData {
  pages: PageData[];
  pageParams: number[];
}

// Query key for service orders
export const serviceOrdersQueryKey: QueryKey = ["serviceOrders"];

// Base hook for getting service orders
export function useServiceOrders() {
  return useQuery({
    queryKey: serviceOrdersQueryKey,
    queryFn: async () => {
      const result = await api.get("/api/service-orders");
      return (Array.isArray(result)
        ? result
        : []) as unknown as OptimisticServiceOrder[];
    },
  });
}

// Hook for getting paginated service orders
export function usePaginatedServiceOrders(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: [...serviceOrdersQueryKey, "paginated"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await api.get("/api/service-orders", {
        query: {
          page: Number(pageParam),
          limit: pageSize,
        },
      });

      // Parse response to an array of service orders
      const serviceOrders = Array.isArray(response) ? response : [];

      // If we receive fewer items than the page size, we know there are no more pages
      const hasNextPage = serviceOrders.length === pageSize;

      return {
        data: serviceOrders,
        nextPage: hasNextPage ? Number(pageParam) + 1 : undefined,
        previousPage: Number(pageParam) > 0 ? Number(pageParam) - 1 : undefined,
        hasNextPage,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

// Hook for creating a service order
export function useCreateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newServiceOrder: Partial<ServiceOrder>) =>
      api.post("/api/service-orders", newServiceOrder),

    // Optimistic update for service order creation
    onMutate: async (newServiceOrder) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: serviceOrdersQueryKey });

      // Snapshot the previous value
      const previousServiceOrders =
        queryClient.getQueryData<OptimisticServiceOrder[]>(
          serviceOrdersQueryKey
        ) ?? [];

      // Optimistically add the new service order to the list
      const optimisticServiceOrder: OptimisticServiceOrder = {
        id: crypto.randomUUID(), // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
        ...newServiceOrder,
        isOptimistic: true,
        optimisticOperation: "create",
      } as OptimisticServiceOrder;

      queryClient.setQueryData(serviceOrdersQueryKey, [
        ...previousServiceOrders,
        optimisticServiceOrder,
      ]);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...serviceOrdersQueryKey, "paginated"];
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

            latestPage.data = [...latestPage.data, optimisticServiceOrder];
            pagesData[pagesData.length - 1] = latestPage;

            return {
              ...old,
              pages: pagesData,
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousServiceOrders, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newServiceOrder, context) => {
      if (context) {
        queryClient.setQueryData(
          serviceOrdersQueryKey,
          context.previousServiceOrders
        );

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...serviceOrdersQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the service orders query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: serviceOrdersQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...serviceOrdersQueryKey, "paginated"],
      });
    },
  });
}

// Hook for updating a service order
export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceOrder> }) =>
      api.put("/api/service-orders", data, { query: { id } }),

    // Optimistic update for service order update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: serviceOrdersQueryKey });

      // Snapshot the previous value
      const previousServiceOrders =
        queryClient.getQueryData<OptimisticServiceOrder[]>(
          serviceOrdersQueryKey
        ) ?? [];

      // Optimistically update the service order in the list
      const updatedServiceOrders = previousServiceOrders.map(
        (serviceOrder: OptimisticServiceOrder) =>
          serviceOrder.id === id
            ? {
                ...serviceOrder,
                ...data,
                updatedAt: new Date(),
                isOptimistic: true,
                optimisticOperation: "update",
              }
            : serviceOrder
      );

      queryClient.setQueryData(serviceOrdersQueryKey, updatedServiceOrders);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...serviceOrdersQueryKey, "paginated"];
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
                data: page.data.map((serviceOrder: OptimisticServiceOrder) =>
                  serviceOrder.id === id
                    ? {
                        ...serviceOrder,
                        ...data,
                        updatedAt: new Date(),
                        isOptimistic: true,
                        optimisticOperation: "update",
                      }
                    : serviceOrder
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousServiceOrders, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(
          serviceOrdersQueryKey,
          context.previousServiceOrders
        );

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...serviceOrdersQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the service orders query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: serviceOrdersQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...serviceOrdersQueryKey, "paginated"],
      });
    },
  });
}

// Hook for deleting a service order
export function useDeleteServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete("/api/service-orders", { query: { id } }),

    // Optimistic update for service order deletion
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: serviceOrdersQueryKey });

      // Snapshot the previous value
      const previousServiceOrders =
        queryClient.getQueryData<OptimisticServiceOrder[]>(
          serviceOrdersQueryKey
        ) ?? [];

      // Optimistically remove the service order from the list
      const updatedServiceOrders = previousServiceOrders.map((serviceOrder) =>
        serviceOrder.id === id
          ? {
              ...serviceOrder,
              isOptimistic: true,
              optimisticOperation: "delete",
            }
          : serviceOrder
      );

      queryClient.setQueryData(serviceOrdersQueryKey, updatedServiceOrders);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...serviceOrdersQueryKey, "paginated"];
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
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((serviceOrder) =>
                  serviceOrder.id === id
                    ? {
                        ...serviceOrder,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : serviceOrder
                ),
              })),
            };
          }
        );
      }

      // Return a context with the snapshot
      return { previousServiceOrders, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      if (context) {
        queryClient.setQueryData(
          serviceOrdersQueryKey,
          context.previousServiceOrders
        );

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...serviceOrdersQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the service orders query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: serviceOrdersQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...serviceOrdersQueryKey, "paginated"],
      });
    },
  });
}

// Hook for bulk deleting service orders
export function useBulkDeleteServiceOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      api.post("/api/service-orders/bulk", { ids }),

    // Optimistic update for bulk service order deletion
    onMutate: async (ids) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: serviceOrdersQueryKey });

      // Snapshot the previous value
      const previousServiceOrders =
        queryClient.getQueryData<OptimisticServiceOrder[]>(
          serviceOrdersQueryKey
        ) ?? [];

      // Optimistically mark selected service orders as deleted
      const updatedServiceOrders = previousServiceOrders.map((serviceOrder) =>
        ids.includes(serviceOrder.id)
          ? {
              ...serviceOrder,
              isOptimistic: true,
              optimisticOperation: "delete",
            }
          : serviceOrder
      );

      queryClient.setQueryData(serviceOrdersQueryKey, updatedServiceOrders);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...serviceOrdersQueryKey, "paginated"];
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
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((serviceOrder) =>
                  ids.includes(serviceOrder.id)
                    ? {
                        ...serviceOrder,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : serviceOrder
                ),
              })),
            };
          }
        );
      }

      // Return a context with the snapshot
      return { previousServiceOrders, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, ids, context) => {
      if (context) {
        queryClient.setQueryData(
          serviceOrdersQueryKey,
          context.previousServiceOrders
        );

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...serviceOrdersQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the service orders query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: serviceOrdersQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...serviceOrdersQueryKey, "paginated"],
      });
    },
  });
}
