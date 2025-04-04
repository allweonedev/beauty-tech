import React, { useMemo } from "react";
import { DataTable } from "@/components/helper/data-table";
import { getReceiptColumns } from "./ReceiptColumns";
import type { Receipt } from "@/types/receipt";
import { useTranslations } from "next-intl";
import { useBulkDeleteReceipts, useReceiptSearch } from "@/hooks/useReceipts";

// Extended Receipt type that includes API-populated fields
interface ReceiptWithRelations extends Receipt {
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface ReceiptsListProps {
  receipts: Receipt[];
  onNewReceipt?: () => void;
  onEditReceipt?: (receipt: Receipt) => void;
  isLoading?: boolean;
  isMutating?: boolean;
  hasMore?: boolean;
  // Page size change props
  onPageSizeChange?: (size: number) => void;
  currentPageSize?: number;
  // Server-side pagination props
  totalCount?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export function ReceiptsList({
  receipts,
  onNewReceipt,
  onEditReceipt,
  isLoading = false,
  isMutating = false,
  hasMore,
  onPageSizeChange,
  currentPageSize,
  totalCount,
  onPageChange,
  currentPage,
}: ReceiptsListProps) {
  const t = useTranslations();

  // Create columns with the appropriate callbacks
  const receiptColumns = useMemo(
    () =>
      getReceiptColumns({
        t,
        onEditReceipt,
        isMutating,
      }),
    [onEditReceipt, isMutating, t]
  );

  // Custom filter function for status field
  const statusFilterFn = (receipt: Receipt, filterValue: string) => {
    return receipt.status === filterValue;
  };

  return (
    <DataTable
      data={receipts as unknown as ReceiptWithRelations[]}
      columns={receiptColumns}
      // Actions
      onNewItem={onNewReceipt}
      onEditItem={
        onEditReceipt as ((item: ReceiptWithRelations) => void) | undefined
      }
      useBulkDeleteHook={useBulkDeleteReceipts} // Provide the hook directly
      // State
      isLoading={isLoading}
      isMutating={isMutating}
      // Infinite loading
      hasMore={hasMore}
      // Pagination
      onPageSizeChange={onPageSizeChange}
      currentPageSize={currentPageSize}
      // Translation
      translationPrefix="receipts"
      // Search and filter
      searchKeys={["number", "notes"]}
      filterOptions={[
        { value: "draft", label: t("receipts.status.draft") },
        { value: "issued", label: t("receipts.status.issued") },
        { value: "paid", label: t("receipts.status.paid") },
        { value: "overdue", label: t("receipts.status.overdue") },
        { value: "cancelled", label: t("receipts.status.cancelled") },
      ]}
      customFilterFn={statusFilterFn}
      // Server-side search
      useServerSearch={useReceiptSearch}
      serverSearchDebounce={300}
      // Customization
      title={t("receipts.title")}
      newItemLabel={t("receipts.newReceipt")}
      emptyStateMessage={t("receipts.noReceiptsRegistered")}
      filteredEmptyStateMessage={t("receipts.noReceiptsFound")}
      // Server-side pagination
      totalCount={totalCount}
      onPageChange={onPageChange}
      currentPage={currentPage}
    />
  );
}
