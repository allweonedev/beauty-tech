"use client";
import React, { useMemo } from "react";
import { DataTable } from "@/components/helper/data-table";
import { getContractColumns } from "./ContractColumns";
import type { Contract } from "@/types/contract";
import { useTranslations } from "next-intl";
import { useBulkDeleteContracts } from "@/hooks/useContracts";
import { type UseQueryResult } from "@tanstack/react-query";

interface ContractsTableProps {
  contracts: Contract[];
  onNewContract?: () => void;
  onEditContract?: (contract: Contract) => void;
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
  // Server-side search
  useServerSearch?: (searchTerm: string) => UseQueryResult<Contract[]>;
}

export default function ContractsTable({
  contracts,
  onNewContract,
  onEditContract,
  isLoading = false,
  isMutating = false,
  hasMore,
  onPageSizeChange,
  currentPageSize,
  totalCount,
  onPageChange,
  currentPage,
  useServerSearch,
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
      hasMore={hasMore}
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
      // Server-side pagination
      totalCount={totalCount}
      onPageChange={onPageChange}
      currentPage={currentPage}
      // Server-side search
      useServerSearch={useServerSearch}
      serverSearchDebounce={300}
    />
  );
}
