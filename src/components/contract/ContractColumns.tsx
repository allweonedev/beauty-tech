/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { type ReactNode } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  createSelectColumn,
  createActionsColumn,
  createDateColumn,
  createBadgeColumn,
} from "@/components/helper/table-column-helper";
import type { Contract } from "@/types/contract";
import { type useTranslations } from "next-intl";
import { useDeleteContract } from "@/hooks/useContracts";
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

interface GetContractColumnsProps {
  t: ReturnType<typeof useTranslations>;
  onEditContract?: (contract: Contract) => void;
  isMutating?: boolean;
}

export function getContractColumns({
  t,
  onEditContract,
  isMutating = false,
}: GetContractColumnsProps): ColumnDef<Contract>[] {
  const columns: ColumnDef<Contract>[] = [
    // Selection column
    createSelectColumn<Contract>(),

    // Title and client
    {
      accessorKey: "title",
      header: t("contracts.columns.title"),
      cell: (info) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {info.getValue<string>()}
          </div>
          <div className="text-sm text-gray-500">
            {info.row.original.client?.name || "-"}
          </div>
        </div>
      ),
    },

    // Description
    {
      accessorKey: "description",
      header: t("contracts.columns.description"),
      cell: (info) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {info.getValue<string>() || "-"}
        </div>
      ),
    },

    // Status badge
    createBadgeColumn<Contract, "pending" | "signed" | "expired" | "cancelled">(
      "status",
      t("contracts.columns.status"),
      {
        getBadgeColor: (value) => {
          switch (value) {
            case "pending":
              return "bg-yellow-100 text-yellow-800";
            case "signed":
              return "bg-green-100 text-green-800";
            case "expired":
              return "bg-gray-100 text-gray-800";
            case "cancelled":
              return "bg-red-100 text-red-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        },
        getLabel: (value) => {
          switch (value) {
            case "pending":
              return t("contracts.status.pending");
            case "signed":
              return t("contracts.status.signed");
            case "expired":
              return t("contracts.status.expired");
            case "cancelled":
              return t("contracts.status.cancelled");
            default:
              return value;
          }
        },
      }
    ),

    // Document URL
    {
      accessorKey: "documentUrl",
      header: t("contracts.columns.document"),
      cell: (info) => (
        <div className="text-sm text-gray-900">
          {info.getValue<string>() ? (
            <a
              href={info.getValue<string>()}
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {t("contracts.viewDocument")}
            </a>
          ) : (
            "-"
          )}
        </div>
      ),
    },

    // Signed date
    createDateColumn<Contract>("signedAt", t("contracts.columns.signedAt")),

    // Expires date
    createDateColumn<Contract>("expiresAt", t("contracts.columns.expiresAt")),

    // Created date
    createDateColumn<Contract>("createdAt", t("contracts.columns.created")),

    // Updated date
    createDateColumn<Contract>("updatedAt", t("contracts.columns.updated")),

    // Actions column with self-contained delete functionality
    createActionsColumn<Contract>({
      t: (key: string, options?: Record<string, unknown>) =>
        t(key, options as Record<string, string | number | Date> | undefined),
      onEditItem: onEditContract,
      useDeleteHook: useDeleteContract,
      isMutating,
      translationPrefix: "contracts",
    }),
  ];

  return columns;
}
