"use client";
import React, { useMemo } from "react";
import { DataTable } from "@/components/helper/data-table";
import { getServiceOrderColumns } from "./ServiceOrderColumns";
import type { ServiceOrder } from "./ServiceOrderModal";
import { useTranslations } from "next-intl";
import { useBulkDeleteServiceOrders } from "@/hooks/useServiceOrders";

interface ServiceOrdersTableProps {
  serviceOrders: ServiceOrder[];
  onNewServiceOrder?: () => void;
  onEditServiceOrder?: (serviceOrder: ServiceOrder) => void;
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

export default function ServiceOrdersTable({
  serviceOrders,
  onNewServiceOrder,
  onEditServiceOrder,
  isLoading = false,
  isMutating = false,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onPageSizeChange,
  currentPageSize,
}: ServiceOrdersTableProps) {
  const t = useTranslations();

  // Create columns with the appropriate callbacks
  const serviceOrderColumns = useMemo(
    () =>
      getServiceOrderColumns({
        t,
        onEditServiceOrder,
        isMutating,
      }),
    [onEditServiceOrder, isMutating]
  );

  // Custom filter function for status field
  const statusFilterFn = (
    serviceOrder: ServiceOrder,
    filterValue: "pending" | "in_progress" | "completed" | "cancelled"
  ) => {
    return serviceOrder.status === filterValue;
  };

  return (
    <DataTable
      data={serviceOrders}
      columns={serviceOrderColumns}
      // Actions
      onNewItem={onNewServiceOrder}
      onEditItem={onEditServiceOrder as (item: ServiceOrder) => void}
      useBulkDeleteHook={useBulkDeleteServiceOrders} // Provide the hook directly
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
      translationPrefix="serviceOrders"
      // Search and filter
      searchKeys={["number", "description", "technicalNotes"]}
      filterOptions={[
        { value: "pending", label: t("serviceOrders.filter.pending") },
        { value: "in_progress", label: t("serviceOrders.filter.inProgress") },
        { value: "completed", label: t("serviceOrders.filter.completed") },
        { value: "cancelled", label: t("serviceOrders.filter.cancelled") },
      ]}
      customFilterFn={statusFilterFn}
      // Customization
      title={t("serviceOrders.title")}
      newItemLabel={t("serviceOrders.newServiceOrder")}
      emptyStateMessage={t("serviceOrders.noServiceOrdersRegistered")}
      filteredEmptyStateMessage={t("serviceOrders.noServiceOrdersFound")}
    />
  );
}
