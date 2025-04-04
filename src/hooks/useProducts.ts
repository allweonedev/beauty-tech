import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/apiFetch";
import type { Product } from "@/types/product";

// Extended Product interface with optimistic flag
interface OptimisticProduct extends Product {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

// Interface for database response
interface DBProduct {
  id: string;
  name: string;
  type: string;
  description: string | null;
  price: { toString: () => string } | number; // Handle Prisma Decimal type
  imageUrl: string | null;
  category: string | null;
  application: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Function to map database product to our product type
function mapDBProductToProduct(dbProduct: DBProduct): Product {
  // Convert Decimal to number if needed
  const price =
    typeof dbProduct.price === "object" && dbProduct.price.toString
      ? parseFloat(dbProduct.price.toString())
      : Number(dbProduct.price);

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    type: dbProduct.type as "equipment" | "service",
    description: dbProduct.description ?? "",
    price,
    imageUrl: dbProduct.imageUrl ?? undefined,
    category: dbProduct.category ?? "",
    application: dbProduct.application ?? "",
    createdAt: new Date(dbProduct.createdAt),
    updatedAt: new Date(dbProduct.updatedAt),
  };
}

// Query key for products
export const productsQueryKey: QueryKey = ["products"];

// Base hook for getting products (maintains old behavior)
export function useProducts() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: async () => {
      const response = await api.get("/api/products");
      return Array.isArray(response) ? response.map(mapDBProductToProduct) : [];
    },
  });
}

// Hook for getting paginated products
export function usePaginatedProducts(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: [...productsQueryKey, "paginated"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await api.get("/api/products", {
        query: {
          page: Number(pageParam),
          limit: pageSize,
        },
      });

      // Parse response to an array of products
      const products = Array.isArray(response)
        ? response.map(mapDBProductToProduct)
        : [];

      // If we receive fewer items than the page size, we know there are no more pages
      const hasNextPage = products.length === pageSize;

      return {
        data: products,
        nextPage: hasNextPage ? Number(pageParam) + 1 : undefined,
        previousPage: Number(pageParam) > 0 ? Number(pageParam) - 1 : undefined,
        hasNextPage,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

// Type for paginated data structure
interface PaginatedData {
  pages: Array<{
    data: OptimisticProduct[];
    nextPage?: number;
    previousPage?: number;
    hasNextPage: boolean;
  }>;
  pageParams: unknown[];
}

// Hook for creating a product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProduct: Partial<Product>) => {
      return api.post("/api/products", newProduct);
    },

    // Optimistic update for product creation
    onMutate: async (newProduct) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: productsQueryKey });

      // Snapshot the previous value
      const previousProducts =
        queryClient.getQueryData<OptimisticProduct[]>(productsQueryKey) ?? [];

      // Optimistically add the new product to the list
      const optimisticProduct: OptimisticProduct = {
        id: crypto.randomUUID(), // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
        ...newProduct,
        isOptimistic: true,
        optimisticOperation: "create",
      } as OptimisticProduct;

      queryClient.setQueryData(productsQueryKey, [
        ...previousProducts,
        optimisticProduct,
      ]);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...productsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedData>(paginatedQueryKey);

      if (paginatedData) {
        void queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData<PaginatedData | undefined>(
          paginatedQueryKey,
          (old) => {
            if (!old) return old;

            // Add to the most recent page
            const pagesData = [...old.pages];
            const latestPage = { ...pagesData[pagesData.length - 1] };

            latestPage.data = [...latestPage.data, optimisticProduct];
            pagesData[pagesData.length - 1] = latestPage;

            return {
              ...old,
              pages: pagesData,
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousProducts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newProduct, context) => {
      if (context) {
        queryClient.setQueryData(productsQueryKey, context.previousProducts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...productsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the products query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...productsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for updating a product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      api.put("/api/products", data, { query: { id } }),

    // Optimistic update for product update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: productsQueryKey });

      // Snapshot the previous value
      const previousProducts =
        queryClient.getQueryData<OptimisticProduct[]>(productsQueryKey) ?? [];

      // Optimistically update the product in the list
      const updatedProducts = previousProducts.map(
        (product: OptimisticProduct) =>
          product.id === id
            ? {
                ...product,
                ...data,
                updatedAt: new Date(),
                isOptimistic: true,
                optimisticOperation: "update",
              }
            : product
      );

      queryClient.setQueryData(productsQueryKey, updatedProducts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...productsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedData>(paginatedQueryKey);

      if (paginatedData) {
        void queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData<PaginatedData | undefined>(
          paginatedQueryKey,
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((product: OptimisticProduct) =>
                  product.id === id
                    ? {
                        ...product,
                        ...data,
                        updatedAt: new Date(),
                        isOptimistic: true,
                        optimisticOperation: "update",
                      }
                    : product
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousProducts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(productsQueryKey, context.previousProducts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...productsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the products query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...productsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for deleting a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete("/api/products", undefined, { query: { id } }),

    // Optimistic update for product deletion
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: productsQueryKey });

      // Snapshot the previous value
      const previousProducts =
        queryClient.getQueryData<OptimisticProduct[]>(productsQueryKey) ?? [];

      // Optimistically remove the product from the list
      const updatedProducts = previousProducts.map(
        (product: OptimisticProduct) =>
          product.id === id
            ? { ...product, isOptimistic: true, optimisticOperation: "delete" }
            : product
      );

      queryClient.setQueryData(productsQueryKey, updatedProducts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...productsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedData>(paginatedQueryKey);

      if (paginatedData) {
        void queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData<PaginatedData | undefined>(
          paginatedQueryKey,
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((product: OptimisticProduct) =>
                  product.id === id
                    ? {
                        ...product,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : product
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousProducts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, id, context) => {
      if (context) {
        queryClient.setQueryData(productsQueryKey, context.previousProducts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...productsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the products query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...productsQueryKey, "paginated"],
      });
    },
  });
}

// Hook for bulk deleting products
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      api.delete("/api/products/bulk", { body: { ids } }),

    // Optimistic update for bulk product deletion
    onMutate: async (ids) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: productsQueryKey });

      // Snapshot the previous value
      const previousProducts =
        queryClient.getQueryData<OptimisticProduct[]>(productsQueryKey) ?? [];

      // Optimistically mark products for deletion
      const updatedProducts = previousProducts.map(
        (product: OptimisticProduct) =>
          ids.includes(product.id)
            ? { ...product, isOptimistic: true, optimisticOperation: "delete" }
            : product
      );

      queryClient.setQueryData(productsQueryKey, updatedProducts);

      // Also update paginated data if it exists
      const paginatedQueryKey = [...productsQueryKey, "paginated"];
      const paginatedData =
        queryClient.getQueryData<PaginatedData>(paginatedQueryKey);

      if (paginatedData) {
        void queryClient.cancelQueries({ queryKey: paginatedQueryKey });
        // Handle optimistic update for infinite query
        queryClient.setQueryData<PaginatedData | undefined>(
          paginatedQueryKey,
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((product: OptimisticProduct) =>
                  ids.includes(product.id)
                    ? {
                        ...product,
                        isOptimistic: true,
                        optimisticOperation: "delete",
                      }
                    : product
                ),
              })),
            };
          }
        );
      }

      // Return a context object with the snapshot value
      return { previousProducts, paginatedData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, ids, context) => {
      if (context) {
        queryClient.setQueryData(productsQueryKey, context.previousProducts);

        // Reset paginated data if it was updated
        if (context.paginatedData) {
          queryClient.setQueryData(
            [...productsQueryKey, "paginated"],
            context.paginatedData
          );
        }
      }
    },

    // After success or error, refetch the products query
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
      void queryClient.invalidateQueries({
        queryKey: [...productsQueryKey, "paginated"],
      });
    },
  });
}
