import React, { useMemo } from "react";
import { DataTable } from "@/components/helper/data-table";
import { getProductColumns } from "./ProductColumns";
import type { Product } from "@/types/product";
import { useTranslations } from "next-intl";
import { useBulkDeleteProducts, useProductSearch } from "@/hooks/useProducts";

interface ProductsTableProps {
  products: Product[];
  onNewProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  isLoading?: boolean;
  isMutating?: boolean;
  // Infinite loading props
  hasMore?: boolean;
  // Page size change props
  onPageSizeChange?: (size: number) => void;
  currentPageSize?: number;
  // Server-side pagination props
  totalCount?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export default function ProductsTable({
  products,
  onNewProduct,
  onEditProduct,
  isLoading = false,
  isMutating = false,
  hasMore,
  onPageSizeChange,
  currentPageSize,
  totalCount,
  onPageChange,
  currentPage,
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
      hasMore={hasMore}
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
      // Server-side search
      useServerSearch={useProductSearch}
      serverSearchDebounce={300}
      // Customization
      title={t("products.title")}
      newItemLabel={t("products.newProduct")}
      emptyStateMessage={t("products.noProductsRegistered")}
      filteredEmptyStateMessage={t("products.noProductsFound")}
      // Server-side pagination
      totalCount={totalCount}
      onPageChange={onPageChange}
      currentPage={currentPage}
    />
  );
}
