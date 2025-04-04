import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getProductColumns } from "./ProductColumns";
import type { Product } from "@/types/product";
import { useTranslations } from "next-intl";
import { useBulkDeleteProducts } from "@/hooks/useProducts";

interface ProductsTableProps {
  products: Product[];
  onNewProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  isLoading?: boolean;
  isMutating?: boolean;
  // Infinite loading props
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  // Page size change props
  onPageSizeChange?: (size: number) => void;
  currentPageSize?: number;
}

export default function ProductsTable({
  products,
  onNewProduct,
  onEditProduct,
  isLoading = false,
  isMutating = false,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onPageSizeChange,
  currentPageSize,
}: ProductsTableProps) {
  const t = useTranslations();

  // Create columns with the appropriate callbacks
  const productColumns = useMemo(
    () =>
      getProductColumns({
        t,
        onEditProduct,
        isMutating,
      }),
    [onEditProduct, isMutating]
  );

  // Custom filter function for product type field
  const typeFilterFn = (
    product: Product,
    filterValue: "equipment" | "service"
  ) => {
    return product.type === filterValue;
  };

  return (
    <DataTable
      data={products}
      columns={productColumns}
      // Actions
      onNewItem={onNewProduct}
      onEditItem={onEditProduct as (item: Product) => void}
      useBulkDeleteHook={useBulkDeleteProducts} // Provide the hook directly
      // State
      isLoading={isLoading}
      isMutating={isMutating}
      // Infinite loading
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      // Pagination
      onPageSizeChange={onPageSizeChange}
      currentPageSize={currentPageSize}
      // Translation
      translationPrefix="products"
      // Search and filter
      searchKeys={["name", "description", "category", "application"]}
      filterOptions={[
        { value: "equipment", label: t("products.filter.equipment") },
        { value: "service", label: t("products.filter.service") },
      ]}
      customFilterFn={typeFilterFn}
      // Customization
      title={t("products.title")}
      newItemLabel={t("products.newProduct")}
      emptyStateMessage={t("products.noProductsRegistered")}
      filteredEmptyStateMessage={t("products.noProductsFound")}
    />
  );
}
