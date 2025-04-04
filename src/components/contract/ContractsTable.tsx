"use client";
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
import { getContractColumns } from "./ContractColumns";
import { ContractModal, type Contract } from "./ContractModal";
import {
  useContracts,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
  useBulkDeleteContracts,
} from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { type Client } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Extended Contract interface with optimistic flag
interface OptimisticContract extends Contract {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

export function ContractsTable() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "signed" | "expired" | "cancelled"
  >("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<
    Contract | undefined
  >();

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Use hooks directly
  const { data: contracts = [], isLoading } = useContracts();
  const { data: clients = [] } = useClients();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();
  const bulkDeleteContracts = useBulkDeleteContracts();

  // Filter logic
  const filteredData = React.useMemo(() => {
    return (contracts as unknown as OptimisticContract[]).filter((contract) => {
      // Search filter
      const matchesSearch =
        contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.client.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (contract.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ??
          false);

      // Status filter
      const matchesFilter =
        filterStatus === "all" || contract.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [contracts, searchQuery, filterStatus]);

  // Convert rowSelection to an array of contract IDs
  const selectedContractIds = Object.keys(rowSelection)
    .map((index) => {
      const idx = parseInt(index);
      return idx < filteredData.length ? filteredData[idx].id : null;
    })
    .filter((id) => id !== null);

  // Handle view document
  function handleViewDocument(documentUrl: string) {
    window.open(documentUrl, "_blank");
  }

  // Add handleSendReminder function
  function handleSendReminder(contract: Contract) {
    try {
      // In a real app, integrate with email service or DocuSign API
      toast({
        title: t("contracts.reminderSent") || "Reminder Sent",
        description:
          t("contracts.reminderSentTo", { name: contract.client.name }) ||
          `Reminder sent to ${contract.client.name}`,
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        variant: "destructive",
        title: t("common.error") || "Error",
        description:
          t("contracts.reminderError") ||
          "Error sending reminder. Please try again.",
      });
    }
  }

  // Get columns from the separate component
  const columns = getContractColumns({
    t,
    onEditContract: handleEditContract,
    onDeleteContract: handleDeleteContract,
    onViewDocument: handleViewDocument,
    onSendReminder: handleSendReminder,
    isMutating:
      createContract.isPending ||
      updateContract.isPending ||
      deleteContract.isPending,
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

  // Handle new contract
  function handleNewContract() {
    setSelectedContract(undefined);
    setModalOpen(true);
  }

  // Handle edit contract
  function handleEditContract(contract: Contract) {
    setSelectedContract(contract);
    setModalOpen(true);
  }

  // Handle save contract
  function handleSaveContract(contractData: Partial<Contract>) {
    if (selectedContract) {
      // Update existing contract
      updateContract.mutate({
        id: selectedContract.id,
        data: contractData,
      });
    } else {
      // Create new contract
      createContract.mutate(contractData as Contract);
    }
    setModalOpen(false);
  }

  // Handle delete contract
  function handleDeleteContract(contractId: string) {
    deleteContract.mutate(contractId);
  }

  // Handle bulk delete
  function handleBulkDelete() {
    if (selectedContractIds.length > 0) {
      try {
        // Apply bulk delete
        bulkDeleteContracts.mutate(selectedContractIds);
        // Clear selection after deletion is initiated
        setRowSelection({});
        setConfirmDialogOpen(false);
      } catch (error) {
        console.error("Error in bulk delete:", error);
      }
    } else {
      setConfirmDialogOpen(false);
    }
  }

  // Get optimistic status style
  const getRowStyles = (row: OptimisticContract) => {
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
            {t("contracts.title")}
          </h2>
          <div className="flex gap-2">
            {selectedContractIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDialogOpen(true)}
                disabled={bulkDeleteContracts.isPending}
                className="flex items-center gap-1"
              >
                <Trash className="w-4 h-4" />
                {t("contracts.deleteSelected", {
                  count: selectedContractIds.length,
                })}
              </Button>
            )}
            <Button
              onClick={handleNewContract}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={createContract.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("contracts.newContract")}
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
            value={filterStatus}
            onValueChange={(
              value: "all" | "pending" | "signed" | "expired" | "cancelled"
            ) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("contracts.filterStatus")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="pending">
                {t("contracts.status.pending")}
              </SelectItem>
              <SelectItem value="signed">
                {t("contracts.status.signed")}
              </SelectItem>
              <SelectItem value="expired">
                {t("contracts.status.expired")}
              </SelectItem>
              <SelectItem value="cancelled">
                {t("contracts.status.cancelled")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center gap-1 cursor-pointer select-none"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="h-4 w-4" />,
                          desc: <ChevronDown className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ??
                          (header.column.getCanSort() ? (
                            <ChevronsUpDown className="h-4 w-4" />
                          ) : null)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="text-gray-500">{t("common.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`cursor-pointer ${getRowStyles(
                    row.original as OptimisticContract
                  )}`}
                  onClick={() => handleEditContract(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <span className="text-gray-500">
                    {t("contracts.noResults")}
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            {t("common.rowsSelected", { count: selectedContractIds.length })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              {t("common.rowsPerPage")}
            </span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              {t("common.page")}{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} {t("common.of")}{" "}
                {table.getPageCount() || 1}
              </strong>
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog for bulk delete */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("contracts.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("contracts.confirmDeleteDescription", {
                count: selectedContractIds.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contract modal */}
      {modalOpen && (
        <ContractModal
          contract={selectedContract}
          clients={clients as unknown as Client[]}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveContract}
        />
      )}
    </div>
  );
}
