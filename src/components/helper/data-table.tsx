import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import debounce from "lodash.debounce";
import {
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  Search,
  Plus,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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
  type ColumnDef,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BulkDeleteButton } from "@/components/helper/bulk-delete-button";

// Base entity interface that all data types should extend
export interface BaseEntity {
  id: string;
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

// Filter option type
export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

// DataTable props
export interface DataTableProps<
  TData extends BaseEntity,
  TFilterValue extends string = string,
> {
  // Data
  data: TData[];
  columns: ColumnDef<TData>[];

  // Callbacks
  onNewItem?: () => void;
  onEditItem?: (item: TData) => void;
  useBulkDeleteHook?: () => UseMutationResult<
    unknown,
    Error,
    string[],
    unknown
  >;

  // State flags
  isLoading?: boolean;
  isMutating?: boolean;

  // Infinite loading props
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;

  // Pagination props
  onPageSizeChange?: (size: number) => void;
  currentPageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;

  // Translations
  translationPrefix?: string;

  // Search and filter
  searchPlaceholder?: string;
  disableSearch?: boolean;
  searchKeys?: (keyof TData)[];
  filterOptions?: FilterOption<TFilterValue>[];
  defaultFilterValue?: TFilterValue;
  onFilterChange?: (value: TFilterValue) => void;
  customFilterFn?: (item: TData, filterValue: TFilterValue) => boolean;

  // Server-side search
  useServerSearch?: (searchTerm: string) => UseQueryResult<TData[], unknown>;
  serverSearchDebounce?: number;

  // UI customization
  newItemLabel?: string;
  title?: string;
  emptyStateMessage?: string;
  filteredEmptyStateMessage?: string;
  noSearchResultsMessage?: string;
  rowClassName?: (row: TData) => string;
}

export function DataTable<
  TData extends BaseEntity,
  TFilterValue extends string = string,
>({
  // Data
  data,
  columns,

  // Callbacks
  onNewItem,
  onEditItem,
  useBulkDeleteHook,

  // State flags
  isLoading = false,
  isMutating = false,

  // Infinite loading props
  hasMore,

  // Pagination props
  onPageSizeChange,
  currentPageSize,
  totalCount,
  onPageChange,
  currentPage,

  // Translations
  translationPrefix = "common.table",

  // Search and filter
  searchPlaceholder,
  disableSearch = false,
  searchKeys,
  filterOptions,
  defaultFilterValue,
  onFilterChange,
  customFilterFn,

  // Server-side search
  useServerSearch,
  serverSearchDebounce = 300,

  // UI customization
  newItemLabel,
  title,
  emptyStateMessage,
  filteredEmptyStateMessage,
  noSearchResultsMessage,
  rowClassName,
}: DataTableProps<TData, TFilterValue>) {
  const t = useTranslations();

  // State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [filterValue, setFilterValue] = useState<TFilterValue | "all">(
    defaultFilterValue ?? ("all" as TFilterValue | "all")
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: currentPage ?? 0,
    pageSize: currentPageSize ?? 10,
  });

  // Update pagination when currentPageSize or currentPage prop changes
  useEffect(() => {
    if (
      (currentPageSize && currentPageSize !== pagination.pageSize) ??
      (currentPage !== undefined && currentPage !== pagination.pageIndex)
    ) {
      setPagination((prev) => ({
        pageIndex: currentPage ?? prev.pageIndex,
        pageSize: currentPageSize ?? prev.pageSize,
      }));
    }
  }, [currentPageSize, pagination.pageSize, currentPage, pagination.pageIndex]);

  // Create debounced search handler with lodash.debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, serverSearchDebounce),
    [serverSearchDebounce]
  );

  // Update debouncedSearchQuery when searchQuery changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Get server-side search results if hook is provided
  const serverSearchQuery =
    useServerSearch && debouncedSearchQuery.trim() ? debouncedSearchQuery : "";
  const serverSearchResults = useServerSearch?.(serverSearchQuery) ?? {
    data: undefined,
    isLoading: false,
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Reset to first page when searching
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));

    // Notify parent component of page change if callback exists
    if (onPageChange) {
      onPageChange(0);
    }
  };

  // Combine local data with server search results
  const combinedData = React.useMemo(() => {
    // If no server search or no search query, use the local data
    if (!useServerSearch) {
      return data;
    }

    if (!debouncedSearchQuery.trim()) {
      return data;
    }

    // If server search is loading, show loading state
    if (serverSearchResults.isLoading) {
      return data;
    }

    if (serverSearchResults.data) {
      // When using server search, replace data completely instead of combining
      return serverSearchResults.data;
    }

    return data;
  }, [
    data,
    debouncedSearchQuery,
    serverSearchResults.data,
    serverSearchResults.isLoading,
    useServerSearch,
  ]);

  // Filter data based on search query and selected filter
  const filteredData = React.useMemo(() => {
    return combinedData.filter((item) => {
      // Search filtering - if server search is active, we don't need client-side filtering
      const matchesSearch =
        useServerSearch ??
        (!searchQuery ||
          !searchKeys ||
          searchKeys.some((key) => {
            const value = item[key];
            if (typeof value === "string") {
              return value.toLowerCase().includes(searchQuery.toLowerCase());
            } else if (typeof value === "number") {
              return value.toString().includes(searchQuery);
            }
            return false;
          }));

      // Filter dropdown filtering
      let matchesFilter = true;

      if (filterValue !== "all" && filterOptions && filterOptions.length > 0) {
        if (customFilterFn) {
          matchesFilter = customFilterFn(item, filterValue);
        } else {
          // Default fallback if no custom filter provided
          matchesFilter = false;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [
    combinedData,
    searchQuery,
    filterValue,
    searchKeys,
    customFilterFn,
    filterOptions,
    useServerSearch,
  ]);

  // Get selected item IDs
  const selectedItemIds = Object.keys(rowSelection)
    .map((index) => {
      const idx = parseInt(index);
      return idx < filteredData.length ? filteredData[idx].id : null;
    })
    .filter((id): id is string => id !== null);

  // Clear row selection helper
  const clearRowSelection = () => setRowSelection({});

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
    manualPagination: !!totalCount,
    pageCount: Math.ceil(
      (totalCount ?? filteredData.length) / pagination.pageSize
    ),
  });

  // Calculate total pages for server-side pagination
  const totalPages = totalCount
    ? Math.ceil(totalCount / pagination.pageSize)
    : table.getPageCount();

  // Determine if we can navigate to next/previous pages
  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = totalCount
    ? pagination.pageIndex < totalPages - 1
    : table.getCanNextPage();

  // Get optimistic status style
  const getRowStyles = (row: TData): string => {
    if (!row.isOptimistic) return rowClassName ? rowClassName(row) : "";

    switch (row.optimisticOperation) {
      case "create":
        return `bg-green-50 border-l-4 border-green-400 ${rowClassName ? rowClassName(row) : ""}`;
      case "update":
        return `bg-blue-50 border-l-4 border-blue-400 ${rowClassName ? rowClassName(row) : ""}`;
      case "delete":
        return `bg-red-50 border-l-4 border-red-400 opacity-60 line-through ${rowClassName ? rowClassName(row) : ""}`;
      default:
        return `bg-gray-50 ${rowClassName ? rowClassName(row) : ""}`;
    }
  };

  // Render the table
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {title ?? t(`${translationPrefix}.title`)}
          </h2>
          <div className="flex gap-2">
            {/* Use BulkDeleteButton component if hook is provided */}
            {useBulkDeleteHook && (
              <BulkDeleteButton
                ids={selectedItemIds}
                useBulkDeleteHook={useBulkDeleteHook}
                translationPrefix={translationPrefix}
                onClearSelection={clearRowSelection}
              />
            )}

            {onNewItem && (
              <Button
                onClick={onNewItem}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isMutating}
              >
                <Plus className="h-4 w-4 mr-2" />
                {newItemLabel ?? t(`${translationPrefix}.newItem`)}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          {!disableSearch && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder ?? t("common.search")}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {useServerSearch && serverSearchResults.isLoading && (
                <div className="absolute right-2 top-2.5">
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          )}

          {filterOptions && filterOptions.length > 0 && (
            <Select
              value={filterValue as string}
              onValueChange={(value) => {
                const newValue = value as TFilterValue | "all";
                setFilterValue(newValue);
                if (onFilterChange && value !== "all") {
                  onFilterChange(value as TFilterValue);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue
                    placeholder={t(`${translationPrefix}.filter.all`)}
                  />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t(`${translationPrefix}.filter.all`)}
                </SelectItem>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                        !row.original.isOptimistic &&
                        onEditItem &&
                        onEditItem(row.original)
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
                              ({t(`${translationPrefix}.deleting`)})
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
                    {searchQuery
                      ? (noSearchResultsMessage ??
                        t(`${translationPrefix}.noItemsFound`))
                      : filterValue !== "all"
                        ? (filteredEmptyStateMessage ??
                          t(`${translationPrefix}.noItemsFound`))
                        : (emptyStateMessage ??
                          t(`${translationPrefix}.noItemsAvailable`))}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination and page size controls */}
      {(filteredData.length > 0 || !!hasMore) && (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 p-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700">
              {t(`${translationPrefix}.pagination.itemsPerPage`)}
            </p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                const newSize = Number(value);
                // Update local pagination state
                setPagination(() => ({
                  pageIndex: 0, // Reset to first page when changing page size
                  pageSize: newSize,
                }));
                // Call the parent handler for global state
                if (onPageSizeChange) {
                  onPageSizeChange(newSize);
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
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
            {/* Traditional pagination buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPageIndex = 0;
                  if (onPageChange) {
                    onPageChange(newPageIndex);
                  }
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: newPageIndex,
                  }));
                }}
                disabled={!canPreviousPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPageIndex = pagination.pageIndex - 1;
                  if (onPageChange) {
                    onPageChange(newPageIndex);
                  }
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: newPageIndex,
                  }));
                }}
                disabled={!canPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="mx-2 text-sm text-gray-700">
                {t(`${translationPrefix}.pagination.showing`)}{" "}
                {pagination.pageIndex + 1}{" "}
                {t(`${translationPrefix}.pagination.of`)} {totalPages ?? 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPageIndex = pagination.pageIndex + 1;
                  if (onPageChange) {
                    onPageChange(newPageIndex);
                  }
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: newPageIndex,
                  }));
                }}
                disabled={!canNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPageIndex = totalPages - 1;
                  if (onPageChange) {
                    onPageChange(newPageIndex);
                  }
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: newPageIndex,
                  }));
                }}
                disabled={!canNextPage}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
