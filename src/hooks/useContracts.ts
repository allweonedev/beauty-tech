/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/apiFetch";
import type { Contract } from "@/types/contract";

// Extended Contract interface with optimistic flag
interface OptimisticContract extends Contract {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

// Query key for contracts
export const contractsQueryKey: QueryKey = ["contracts"];

// Base hook for getting contracts
export function useContracts() {
  return useQuery({
    queryKey: contractsQueryKey,
    queryFn: () => api.get("/api/contracts"),
  });
}

// Hook for getting paginated contracts
export function usePaginatedContracts(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: [...contractsQueryKey, "paginated"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await api.get("/api/contracts", {
        query: {
          page: Number(pageParam),
          limit: pageSize,
        },
      });

      // Parse response to an array of contracts
      const contracts = Array.isArray(response) ? response : [];

      // If we receive fewer items than the page size, we know there are no more pages
      const hasNextPage = contracts.length === pageSize;

      return {
        data: contracts,
        nextPage: hasNextPage ? Number(pageParam) + 1 : undefined,
        previousPage: Number(pageParam) > 0 ? Number(pageParam) - 1 : undefined,
        hasNextPage,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

// Hook for creating a contract
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newContract: Partial<Contract>) =>
      api.post("/api/contracts", newContract),

    // Optimistic update for contract creation
    onMutate: async (newContract) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: contractsQueryKey });

      // Snapshot the previous value
      const previousContracts = queryClient.getQueryData(contractsQueryKey)!;

      // Optimistically add the new contract to the list
      const optimisticContract: OptimisticContract = {
        id: crypto.randomUUID(), // Temporary ID
        title: newContract.title ?? "",
        description: newContract.description ?? "",
        client: newContract.client!,
        status: newContract.status ?? "pending",
        documentUrl: newContract.documentUrl ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
        optimisticOperation: "create",
      } as OptimisticContract;

      queryClient.setQueryData(contractsQueryKey, [
        ...(previousContracts as OptimisticContract[]),
        optimisticContract,
      ]);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...contractsQueryKey, "paginated"];
      const paginatedData = queryClient.getQueryData(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(paginatedQueryKey, (old: unknown) => {
          if (!old) return old;

          const typedOld = old as {
            pages: Array<{
              data: OptimisticContract[];
            }>;
          };

          // Add to the most recent page
          const pagesData = [...typedOld.pages];
          const latestPage = { ...pagesData[pagesData.length - 1] };

          latestPage.data = [...latestPage.data, optimisticContract];
          pagesData[pagesData.length - 1] = latestPage;

          return {
            ...typedOld,
            pages: pagesData,
          };
        });
      }

      // Return a context object with the snapshot value
      return { previousContracts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newContract, context) => {
      if (context) {
        queryClient.setQueryData(contractsQueryKey, context.previousContracts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...contractsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the contracts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...contractsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for updating a contract
export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) =>
      api.put("/api/contracts", data, { query: { id } }),

    // Optimistic update for contract update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: contractsQueryKey });

      // Snapshot the previous value
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const previousContracts = (queryClient.getQueryData(contractsQueryKey) ??
        []) as OptimisticContract[];

      // Optimistically update the contract in the list
      const updatedContracts = previousContracts.map((contract) =>
        contract.id === id
          ? {
              ...contract,
              ...data,
              updatedAt: new Date(),
              isOptimistic: true,
              optimisticOperation: "update",
            }
          : contract
      );

      queryClient.setQueryData(contractsQueryKey, updatedContracts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...contractsQueryKey, "paginated"];
      const paginatedData = queryClient.getQueryData(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(paginatedQueryKey, (old: unknown) => {
          if (!old) return old;

          const typedOld = old as {
            pages: Array<{
              data: OptimisticContract[];
            }>;
          };

          return {
            ...typedOld,
            pages: typedOld.pages.map((page) => ({
              ...page,
              data: page.data.map((contract: OptimisticContract) =>
                contract.id === id
                  ? {
                      ...contract,
                      ...data,
                      updatedAt: new Date(),
                      isOptimistic: true,
                      optimisticOperation: "update",
                    }
                  : contract
              ),
            })),
          };
        });
      }

      // Return a context object with the snapshot value
      return { previousContracts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(contractsQueryKey, context.previousContracts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...contractsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the contracts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...contractsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for deleting a contract
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete("/api/contracts", { query: { id } }),

    // Optimistic update for contract deletion
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: contractsQueryKey });

      // Snapshot the previous value
      const previousContracts = (queryClient.getQueryData(contractsQueryKey) ??
        []) as OptimisticContract[];

      // Filter out the contract that's being deleted, or mark it as being deleted
      const updatedContracts = previousContracts.map((contract) =>
        contract.id === id
          ? { ...contract, isOptimistic: true, optimisticOperation: "delete" }
          : contract
      );

      queryClient.setQueryData(contractsQueryKey, updatedContracts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...contractsQueryKey, "paginated"];
      const paginatedData = queryClient.getQueryData(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(paginatedQueryKey, (old: unknown) => {
          if (!old) return old;

          const typedOld = old as {
            pages: Array<{
              data: OptimisticContract[];
            }>;
          };

          return {
            ...typedOld,
            pages: typedOld.pages.map((page) => ({
              ...page,
              data: page.data.map((contract: OptimisticContract) =>
                contract.id === id
                  ? {
                      ...contract,
                      isOptimistic: true,
                      optimisticOperation: "delete",
                    }
                  : contract
              ),
            })),
          };
        });
      }

      // Return a context object with the snapshot
      return { previousContracts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      if (context) {
        queryClient.setQueryData(contractsQueryKey, context.previousContracts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...contractsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the contracts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...contractsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for bulk deleting contracts
export function useBulkDeleteContracts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      api.delete("/api/contracts/bulk", {
        query: { ids: ids.join(",") },
      }),

    // Optimistic update for bulk contract deletion
    onMutate: async (ids) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: contractsQueryKey });

      // Snapshot the previous value
      const previousContracts = queryClient.getQueryData(
        contractsQueryKey
      )! as OptimisticContract[];

      // Mark all selected contracts as being deleted
      const updatedContracts = previousContracts.map((contract) =>
        ids.includes(contract.id)
          ? { ...contract, isOptimistic: true, optimisticOperation: "delete" }
          : contract
      );

      queryClient.setQueryData(contractsQueryKey, updatedContracts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...contractsQueryKey, "paginated"];
      const paginatedData = queryClient.getQueryData(paginatedQueryKey);

      if (paginatedData) {
        await queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData(paginatedQueryKey, (old: unknown) => {
          if (!old) return old;

          const typedOld = old as {
            pages: Array<{
              data: OptimisticContract[];
            }>;
          };

          return {
            ...typedOld,
            pages: typedOld.pages.map((page) => ({
              ...page,
              data: page.data.map((contract: OptimisticContract) =>
                ids.includes(contract.id)
                  ? {
                      ...contract,
                      isOptimistic: true,
                      optimisticOperation: "delete",
                    }
                  : contract
              ),
            })),
          };
        });
      }

      // Return a context with the previous contracts
      return { previousContracts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, ids, context) => {
      if (context) {
        queryClient.setQueryData(contractsQueryKey, context.previousContracts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...contractsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the contracts query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: contractsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...contractsQueryKey, "paginated"],
      });
    },
  });
}
