import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/apiFetch";
import type { Receipt } from "@/types/receipt";

// Extended Receipt interface with optimistic flag
interface OptimisticReceipt extends Receipt {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

// Type definitions for paginated data
interface PageData {
  data: OptimisticReceipt[];
  nextPage?: number;
  previousPage?: number;
  hasNextPage: boolean;
  totalCount?: number;
}

interface PaginatedQueryData {
  pages: PageData[];
  pageParams: number[];
}

// Query key for receipts
export const receiptsQueryKey: QueryKey = ["receipts"];

// Base hook for getting receipts (maintains old behavior)
export function useReceipts() {
  return useQuery({
    queryKey: receiptsQueryKey,
    queryFn: async () => {
      const result = await api.get("/api/receipts");
      return (Array.isArray(result)
        ? result
        : []) as unknown as OptimisticReceipt[];
    },
  });
}

// Hook for getting paginated receipts
export function usePaginatedReceipts(pageSize = 10, page = 0) {
  return useInfiniteQuery({
    queryKey: [...receiptsQueryKey, "paginated", pageSize, page],
    initialPageParam: page,
    queryFn: async ({ pageParam }) => {
      const response = await api.get("/api/receipts", {
        query: {
          page: Number(pageParam),
          limit: pageSize,
        },
      });

      // Handle the new response format
      if (
        typeof response === "object" &&
        response !== null &&
        "data" in response &&
        "meta" in response
      ) {
        const receipts = Array.isArray(response.data) ? response.data : [];
        const totalCount = response.meta?.totalCount ?? 0;

        // If we've fetched all items, there are no more pages
        const hasNextPage = (Number(pageParam) + 1) * pageSize < totalCount;

        return {
          data: receipts as unknown as OptimisticReceipt[],
          nextPage: hasNextPage ? Number(pageParam) + 1 : undefined,
          previousPage:
            Number(pageParam) > 0 ? Number(pageParam) - 1 : undefined,
          hasNextPage,
          totalCount,
        };
      }

      // Fallback for old API format or error
      const receipts = Array.isArray(response) ? response : [];
      return {
        data: receipts as unknown as OptimisticReceipt[],
        nextPage:
          receipts.length === pageSize ? Number(pageParam) + 1 : undefined,
        previousPage: Number(pageParam) > 0 ? Number(pageParam) - 1 : undefined,
        hasNextPage: receipts.length === pageSize,
        totalCount: 0, // Unknown total count in this case
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Hook for getting receipts for a specific client
export function useClientReceipts(clientId: string | undefined) {
  return useQuery({
    queryKey: [...receiptsQueryKey, "client", clientId],
    queryFn: async () => {
      if (!clientId) return [] as Receipt[];

      const result = await api.get("/api/receipts", {
        query: {
          clientId,
        },
      });

      if (typeof result === "object" && result !== null && "data" in result) {
        return Array.isArray(result.data) ? result.data : [];
      }

      return Array.isArray(result) ? result : [];
    },
    enabled: !!clientId,
  });
}

// Hook for creating a receipt
export function useCreateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newReceipt: Partial<Receipt>) =>
      api.post("/api/receipts", newReceipt),

    // Optimistic update for receipt creation
    onMutate: async (newReceipt) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: receiptsQueryKey });

      // Snapshot the previous value
      const previousReceipts =
        queryClient.getQueryData<OptimisticReceipt[]>(receiptsQueryKey) ?? [];

      // Optimistically add the new receipt to the list
      const optimisticReceipt: OptimisticReceipt = {
        id: crypto.randomUUID(), // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
        number: `REC-TEMP-${Math.floor(Math.random() * 10000)}`,
        clientId: newReceipt.clientId ?? "",
        date: newReceipt.date ?? new Date(),
        paymentMethod: newReceipt.paymentMethod ?? "cash",
        status: "draft",
        items: newReceipt.items ?? [],
        subtotal: newReceipt.subtotal ?? 0,
        tax: newReceipt.tax ?? 0,
        discount: newReceipt.discount ?? 0,
        total: newReceipt.total ?? 0,
        notes: newReceipt.notes ?? null,
        ...newReceipt,
        isOptimistic: true,
        optimisticOperation: "create",
      } as OptimisticReceipt;

      queryClient.setQueryData(receiptsQueryKey, [
        ...previousReceipts,
        optimisticReceipt,
      ]);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...receiptsQueryKey, "paginated"];
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

            latestPage.data = [...latestPage.data, optimisticReceipt];
            pagesData[pagesData.length - 1] = latestPage;

            return {
              ...old,
              pages: pagesData,
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousReceipts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newReceipt, context) => {
      if (context) {
        queryClient.setQueryData(receiptsQueryKey, context.previousReceipts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...receiptsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the receipts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: receiptsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...receiptsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for updating a receipt
export function useUpdateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Receipt> }) =>
      api.put("/api/receipts", data, { query: { id } }),

    // Optimistic update for receipt update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: receiptsQueryKey });

      // Snapshot the previous value
      const previousReceipts =
        queryClient.getQueryData<OptimisticReceipt[]>(receiptsQueryKey) ?? [];

      // Optimistically update the receipt in the list
      const updatedReceipts = previousReceipts.map(
        (receipt: OptimisticReceipt) =>
          receipt.id === id
            ? {
                ...receipt,
                ...data,
                updatedAt: new Date(),
                isOptimistic: true,
                optimisticOperation: "update",
              }
            : receipt
      );

      queryClient.setQueryData(receiptsQueryKey, updatedReceipts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...receiptsQueryKey, "paginated"];
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
                data: page.data.map((receipt: OptimisticReceipt) =>
                  receipt.id === id
                    ? {
                        ...receipt,
                        ...data,
                        updatedAt: new Date(),
                        isOptimistic: true,
                        optimisticOperation: "update",
                      }
                    : receipt
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousReceipts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(receiptsQueryKey, context.previousReceipts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...receiptsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the receipts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: receiptsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...receiptsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for deleting a receipt
export function useDeleteReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete("/api/receipts", undefined, { query: { id } }),

    // Optimistic update for receipt deletion
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: receiptsQueryKey });

      // Snapshot the previous value
      const previousReceipts =
        queryClient.getQueryData<OptimisticReceipt[]>(receiptsQueryKey) ?? [];

      // Mark receipt as being deleted but don't remove it yet (visual feedback)
      const updatedReceipts = previousReceipts.map(
        (receipt: OptimisticReceipt) =>
          receipt.id === id
            ? { ...receipt, isOptimistic: true, optimisticOperation: "delete" }
            : receipt
      );

      queryClient.setQueryData(receiptsQueryKey, updatedReceipts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...receiptsQueryKey, "paginated"];
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
                data: page.data.map((receipt: OptimisticReceipt) =>
                  receipt.id === id
                    ? {
                        ...receipt,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : receipt
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousReceipts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      if (context) {
        queryClient.setQueryData(receiptsQueryKey, context.previousReceipts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...receiptsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the receipts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: receiptsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...receiptsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for bulk deleting receipts
export function useBulkDeleteReceipts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => api.post("/api/receipts/bulk", { ids }),

    // Optimistic update for bulk receipt deletion
    onMutate: async (receiptIds) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: receiptsQueryKey });

      // Snapshot the previous value
      const previousReceipts =
        queryClient.getQueryData<OptimisticReceipt[]>(receiptsQueryKey) ?? [];

      // No need to check if previousReceipts is null/undefined as we provide a default above

      // Mark receipts as being deleted with visual indication
      const updatedReceipts = previousReceipts.map(
        (receipt: OptimisticReceipt) =>
          receiptIds.includes(receipt.id)
            ? { ...receipt, isOptimistic: true, optimisticOperation: "delete" }
            : receipt
      );

      // Apply the optimistic update
      queryClient.setQueryData(receiptsQueryKey, updatedReceipts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...receiptsQueryKey, "paginated"];
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
                data: page.data.map((receipt: OptimisticReceipt) =>
                  receiptIds.includes(receipt.id)
                    ? {
                        ...receipt,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : receipt
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousReceipts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, receiptIds, context) => {
      if (context) {
        queryClient.setQueryData(receiptsQueryKey, context.previousReceipts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...receiptsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the receipts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: receiptsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...receiptsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for searching receipts
export function useReceiptSearch(searchTerm: string) {
  return useQuery({
    queryKey: ["receiptSearch", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [] as Receipt[];
      try {
        const response = await api.get("/api/receipts/search", {
          query: { q: searchTerm },
        });
        return (Array.isArray(response)
          ? response
          : []) as unknown as Receipt[];
      } catch (error) {
        console.error("Error searching receipts:", error);
        return [] as Receipt[];
      }
    },
    enabled: searchTerm.trim().length > 0,
  });
}
