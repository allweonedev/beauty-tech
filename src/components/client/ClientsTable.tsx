import React, { useMemo } from "react";
import { DataTable } from "@/components/helper/data-table";
import { getClientColumns } from "./ClientColumns";
import type { Client } from "@/types/client";
import { useTranslations } from "next-intl";
import { useBulkDeleteClients, useClientSearch } from "@/hooks/useClients";

interface ClientsListProps {
  clients: Client[];
  onNewClient?: () => void;
  onEditClient?: (client: Client) => void;
  isLoading?: boolean;
  isMutating?: boolean;
  // Infinite loading props
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  // Page size change props
  onPageSizeChange?: (size: number) => void;
  currentPageSize?: number;
  // Server-side pagination props
  totalCount?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export function ClientsList({
  clients,
  onNewClient,
  onEditClient,
  isLoading = false,
  isMutating = false,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onPageSizeChange,
  currentPageSize,
  totalCount,
  onPageChange,
  currentPage,
}: ClientsListProps) {
  const t = useTranslations();

  // Create columns with the appropriate callbacks
  const clientColumns = useMemo(
    () =>
      getClientColumns({
        t,
        onEditClient,
        isMutating,
      }),
    [onEditClient, isMutating]
  );

  // Custom filter function for source field
  const sourceFilterFn = (
    client: Client,
    filterValue: "manual" | "smart-link"
  ) => {
    return client.source === filterValue;
  };

  return (
    <DataTable
      data={clients}
      columns={clientColumns}
      // Actions
      onNewItem={onNewClient}
      onEditItem={onEditClient}
      useBulkDeleteHook={useBulkDeleteClients} // Provide the hook directly
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
      translationPrefix="clients"
      // Search and filter
      searchKeys={["name", "email", "phone"]}
      filterOptions={[
        { value: "manual", label: t("clients.filter.manual") },
        { value: "smart-link", label: t("clients.filter.smartLink") },
      ]}
      customFilterFn={sourceFilterFn}
      // Server-side search
      useServerSearch={useClientSearch}
      serverSearchDebounce={300}
      // Customization
      title={t("clients.title")}
      newItemLabel={t("clients.newClient")}
      emptyStateMessage={t("clients.noClientsRegistered")}
      filteredEmptyStateMessage={t("clients.noClientsFound")}
      // Server-side pagination
      totalCount={totalCount}
      onPageChange={onPageChange}
      currentPage={currentPage}
    />
  );
}
