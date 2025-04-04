/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Edit,
  MoreVertical,
  RefreshCw,
  Trash,
  Download,
  FileText,
  Send,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { type Contract } from "./ContractModal";

// Extended Contract interface with optimistic flag
interface OptimisticContract extends Contract {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

interface GetContractColumnsProps {
  t: (key: string, params?: Record<string, string>) => string;
  onEditContract: (contract: Contract) => void;
  onDeleteContract: (contractId: string) => void;
  onViewDocument: (documentUrl: string) => void;
  onSendReminder?: (contract: Contract) => void;
  isMutating?: boolean;
}

type ContractStatusClasses = {
  [key in Contract["status"]]: string;
};

type ContractStatusText = {
  [key in Contract["status"]]: string;
};

type ContractStatusIcon = {
  [key in Contract["status"]]: React.ReactNode;
};

export function getContractColumns({
  t,
  onEditContract,
  onDeleteContract,
  onViewDocument,
  onSendReminder,
  isMutating = false,
}: GetContractColumnsProps): ColumnDef<OptimisticContract>[] {
  const columnHelper = createColumnHelper<OptimisticContract>();

  const statusIcons: ContractStatusIcon = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    signed: <CheckCircle className="w-4 h-4 text-green-500" />,
    expired: <XCircle className="w-4 h-4 text-red-500" />,
    cancelled: <XCircle className="w-4 h-4 text-gray-500" />,
  };

  return [
    // Selection column
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean | "indeterminate") =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label={t("common.selectAll") || "Select all"}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean | "indeterminate") =>
            row.toggleSelected(!!value)
          }
          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            e.stopPropagation()
          }
          aria-label={t("common.select") || "Select row"}
          disabled={row.original.isOptimistic}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("title", {
      header: t("contracts.columns.title") || "Title",
      cell: (info) => (
        <div>
          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
            {info.getValue()}
            {info.row.original.isOptimistic && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <RefreshCw className="w-3 h-3 animate-spin text-indigo-500 ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("contracts.sync") || "Syncing with server..."}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {info.row.original.description}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("client", {
      header: t("contracts.columns.client") ?? "Client",
      cell: (info) => (
        <div>
          <div className="text-sm text-gray-900">{info.getValue().name}</div>
          <div className="text-sm text-gray-500">
            {info.getValue().email || info.getValue().phone || "-"}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: t("contracts.columns.status") || "Status",
      cell: (info) => {
        const status = info.getValue();
        const statusClasses: ContractStatusClasses = {
          pending: "bg-yellow-100 text-yellow-800",
          signed: "bg-green-100 text-green-800",
          expired: "bg-gray-100 text-gray-800",
          cancelled: "bg-red-100 text-red-800",
        };
        const statusText: ContractStatusText = {
          pending: t("contracts.status.pending") || "Pending",
          signed: t("contracts.status.signed") || "Signed",
          expired: t("contracts.status.expired") || "Expired",
          cancelled: t("contracts.status.cancelled") || "Cancelled",
        };

        return (
          <div className="flex items-center gap-1.5">
            {statusIcons[status]}
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
            >
              {statusText[status]}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("documentUrl", {
      header: t("contracts.columns.document") || "Document",
      cell: (info) => (
        <div className="flex items-center">
          <FileText className="mr-2 h-4 w-4 text-gray-500" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDocument(info.getValue());
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            disabled={info.row.original.isOptimistic}
          >
            {t("contracts.viewDocument") || "View"}
          </button>
        </div>
      ),
    }),
    columnHelper.accessor("signedAt", {
      header: t("contracts.columns.signedAt") || "Signed At",
      cell: (info) => {
        const date = info.getValue();
        return (
          <div className="text-sm text-gray-900">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </div>
        );
      },
    }),
    columnHelper.accessor("expiresAt", {
      header: t("contracts.columns.expiresAt") || "Expires At",
      cell: (info) => {
        const date = info.getValue();
        return (
          <div className="text-sm text-gray-900">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: t("contracts.columns.created") || "Created",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("updatedAt", {
      header: t("contracts.columns.updated") || "Updated",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: t("contracts.columns.actions") || "Actions",
      cell: (info) => (
        <div className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
              >
                <span className="sr-only">
                  {t("common.options") || "Options"}
                </span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEditContract(info.row.original)}
                disabled={info.row.original.isOptimistic}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>{t("common.edit") || "Edit"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(info.row.original.documentUrl, "_blank");
                }}
                disabled={info.row.original.isOptimistic}
                className="flex items-center cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                <span>{t("contracts.download") || "Download"}</span>
              </DropdownMenuItem>
              {info.row.original.status === "pending" && onSendReminder && (
                <DropdownMenuItem
                  onClick={() => onSendReminder(info.row.original)}
                  disabled={info.row.original.isOptimistic}
                  className="flex items-center cursor-pointer"
                >
                  <Send className="mr-2 h-4 w-4" />
                  <span>{t("contracts.sendReminder") || "Send Reminder"}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDeleteContract(info.row.original.id)}
                disabled={isMutating || info.row.original.isOptimistic}
                variant="destructive"
                className="flex items-center cursor-pointer text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>
                  {info.row.original.optimisticOperation === "delete"
                    ? t("contracts.deleting") || "Deleting..."
                    : isMutating
                      ? t("contracts.deleting") || "Deleting..."
                      : t("common.delete") || "Delete"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ] as ColumnDef<OptimisticContract>[];
}
