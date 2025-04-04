"use client";
import React, { useMemo } from "react";
import { DataTable } from "@/components/helper/data-table";
import { getContractColumns } from "./ContractColumns";
import type { Contract } from "@/types/contract";
import { useTranslations } from "next-intl";
import { useBulkDeleteContracts } from "@/hooks/useContracts";

interface ContractsTableProps {
  contracts: Contract[];
  onNewContract?: () => void;
  onEditContract?: (contract: Contract) => void;
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

export default function ContractsTable({
  contracts,
  onNewContract,
  onEditContract,
  isLoading = false,
  isMutating = false,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onPageSizeChange,
  currentPageSize,
}: ContractsTableProps) {
  const t = useTranslations();

  // Create columns with the appropriate callbacks
  const contractColumns = useMemo(
    () =>
      getContractColumns({
        t,
        onEditContract,
        isMutating,
      }),
    [onEditContract, isMutating]
  );

  // Custom filter function for status field
  const statusFilterFn = (
    contract: Contract,
    filterValue: "pending" | "signed" | "expired" | "cancelled"
  ) => {
    return contract.status === filterValue;
  };

  return (
    <DataTable
      data={contracts}
      columns={contractColumns}
      // Actions
      onNewItem={onNewContract}
      onEditItem={onEditContract as (item: Contract) => void}
      useBulkDeleteHook={useBulkDeleteContracts} // Provide the hook directly
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
      translationPrefix="contracts"
      // Search and filter
      searchKeys={["title", "description"]}
      filterOptions={[
        { value: "pending", label: t("contracts.filter.pending") },
        { value: "signed", label: t("contracts.filter.signed") },
        { value: "expired", label: t("contracts.filter.expired") },
        { value: "cancelled", label: t("contracts.filter.cancelled") },
      ]}
      customFilterFn={statusFilterFn}
      // Customization
      title={t("contracts.title")}
      newItemLabel={t("contracts.newContract")}
      emptyStateMessage={t("contracts.noContractsRegistered")}
      filteredEmptyStateMessage={t("contracts.noContractsFound")}
    />
  );
}
