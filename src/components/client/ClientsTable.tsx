import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Plus,
  Filter,
  Trash,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Client } from "@/types/client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  type RowSelectionState,
  getPaginationRowModel,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClientColumns } from "./ClientColumns";

// Extended Client interface with optimistic flag
interface OptimisticClient extends Client {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

interface ClientsListProps {
  clients: Client[];
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onBulkDeleteClients?: (clientIds: string[]) => void;
  isLoading: boolean;
  isMutating?: boolean;
  // Infinite loading props
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;

  // Page size change props
  onPageSizeChange?: (size: number) => void;
  currentPageSize?: number;
}

export function ClientsList({
  clients,
  onNewClient,
  onEditClient,
  onDeleteClient,
  onBulkDeleteClients,
  isLoading,
  isMutating = false,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onPageSizeChange,
  currentPageSize,
}: ClientsListProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState<
    "all" | "manual" | "smart-link"
  >("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter logic - moved up before the selectedClientIds calculation
  const filteredData = React.useMemo(() => {
    return (clients as OptimisticClient[]).filter((client) => {
      // Include clients being optimistically deleted, but with visual indication
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false) ||
        (client.phone?.includes(searchQuery) ?? false);

      const matchesFilter =
        filterSource === "all" || client.source === filterSource;

      return matchesSearch && matchesFilter;
    });
  }, [clients, searchQuery, filterSource]);

  // Convert rowSelection to an array of client IDs - now filteredData is defined before it's used
  const selectedClientIds = Object.keys(rowSelection)
    .map((index) => {
      const idx = parseInt(index);
      return idx < filteredData.length ? filteredData[idx].id : null;
    })
    .filter((id) => id !== null);

  // Get columns from the separate component
  const columns = getClientColumns({
    t,
    onEditClient,
    onDeleteClient,
    isMutating,
  });

  // Initialize React Table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
  });

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedClientIds.length > 0 && onBulkDeleteClients) {
      try {
        // Apply bulk delete
        onBulkDeleteClients(selectedClientIds);
        // Clear selection after deletion is initiated
        setRowSelection({});
        setConfirmDialogOpen(false);
      } catch (error) {
        console.error("Error in bulk delete:", error);
      }
    } else {
      setConfirmDialogOpen(false);
    }
  };

  // Get optimistic status style
  const getRowStyles = (row: OptimisticClient) => {
    if (!row.isOptimistic) return "";

    switch (row.optimisticOperation) {
      case "create":
        return "bg-green-50 border-l-4 border-green-400";
      case "update":
        return "bg-blue-50 border-l-4 border-blue-400";
      case "delete":
        return "bg-red-50 border-l-4 border-red-400 opacity-60 line-through";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {t("clients.title")}
          </h2>
          <div className="flex gap-2">
            {selectedClientIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDialogOpen(true)}
                disabled={isMutating}
                className="flex items-center gap-1"
              >
                <Trash className="w-4 h-4" />
                {t("clients.deleteSelected", {
                  count: selectedClientIds.length,
                })}
              </Button>
            )}
            <Button
              onClick={onNewClient}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isMutating}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("clients.newClient")}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("common.search")}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterSource}
            onValueChange={(value: "all" | "manual" | "smart-link") =>
              setFilterSource(value)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("clients.filter.all")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("clients.filter.all")}</SelectItem>
              <SelectItem value="manual">
                {t("clients.filter.manual")}
              </SelectItem>
              <SelectItem value="smart-link">
                {t("clients.filter.smartLink")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`${
                        header.id === "select" ? "w-[40px]" : ""
                      } cursor-pointer`}
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() &&
                          header.id !== "select" && (
                            <span className="ml-1">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </span>
                          )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const isBeingDeleted =
                    row.original.optimisticOperation === "delete";
                  return (
                    <TableRow
                      key={row.id}
                      className={`hover:bg-gray-50 cursor-pointer ${getRowStyles(
                        row.original
                      )}`}
                      onClick={() =>
                        !row.original.isOptimistic && onEditClient(row.original)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                          {isBeingDeleted && cell.column.id === "name" && (
                            <span className="ml-2 text-xs text-red-500 font-medium">
                              ({t("clients.deleting")})
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    {searchQuery || filterSource !== "all"
                      ? t("clients.noClientsFound")
                      : t("clients.noClientsRegistered")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination and page size controls */}
      {filteredData.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 p-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700">
              {t("clients.pagination.itemsPerPage")}
            </p>
            <Select
              value={`${currentPageSize ?? pagination.pageSize}`}
              onValueChange={(value) => {
                const newSize = Number(value);
                // Update local pagination state
                setPagination((prev) => ({
                  ...prev,
                  pageSize: newSize,
                }));
                // Call the parent handler for global state
                if (onPageSizeChange) {
                  onPageSizeChange(newSize);
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={currentPageSize ?? pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            {/* Load more button for infinite loading */}
            {onLoadMore && hasMore && (
              <Button
                onClick={onLoadMore}
                disabled={isLoadingMore ?? !hasMore}
                className="ml-2"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t("clients.loading")}
                  </>
                ) : (
                  t("clients.loadMore")
                )}
              </Button>
            )}

            {/* Traditional pagination buttons (shown only if infinite loading is not used) */}
            {!onLoadMore && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="mx-2 text-sm text-gray-700">
                  {t("clients.pagination.showing")}{" "}
                  {table.getState().pagination.pageIndex + 1}{" "}
                  {t("clients.pagination.of")} {table.getPageCount() || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk delete confirmation dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("clients.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("clients.deleteConfirm.description", {
                count: selectedClientIds.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
