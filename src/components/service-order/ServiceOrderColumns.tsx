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
import { Edit, MoreVertical, RefreshCw, Trash } from "lucide-react";
import { type ServiceOrder } from "./ServiceOrderModal";

// Extended ServiceOrder interface with optimistic flag
interface OptimisticServiceOrder extends ServiceOrder {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

interface GetServiceOrderColumnsProps {
  t: (key: string, params?: Record<string, string>) => string;
  onEditServiceOrder: (serviceOrder: ServiceOrder) => void;
  onDeleteServiceOrder: (serviceOrderId: string) => void;
  isMutating?: boolean;
}

type ServiceOrderStatusClasses = {
  [key in ServiceOrder["status"]]: string;
};

type ServiceOrderStatusText = {
  [key in ServiceOrder["status"]]: string;
};

export function getServiceOrderColumns({
  t,
  onEditServiceOrder,
  onDeleteServiceOrder,
  isMutating = false,
}: GetServiceOrderColumnsProps): ColumnDef<OptimisticServiceOrder>[] {
  const columnHelper = createColumnHelper<OptimisticServiceOrder>();

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
          aria-label="Select all"
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
          aria-label="Select row"
          disabled={row.original.isOptimistic}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("number", {
      header: t("serviceOrders.columns.number"),
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
                    <p>{t("serviceOrders.sync")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("client", {
      header: t("serviceOrders.columns.client"),
      cell: (info) => (
        <div>
          <div className="text-sm text-gray-900">{info.getValue().name}</div>
          <div className="text-sm text-gray-500">
            {info.getValue().phone || "-"}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("product", {
      header: t("serviceOrders.columns.product"),
      cell: (info) => (
        <div className="text-sm text-gray-900">
          {info.getValue()?.name ?? "-"}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: t("serviceOrders.columns.status"),
      cell: (info) => {
        const status = info.getValue();
        const statusClasses: ServiceOrderStatusClasses = {
          pending: "bg-yellow-100 text-yellow-800",
          in_progress: "bg-blue-100 text-blue-800",
          completed: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
        };
        const statusText: ServiceOrderStatusText = {
          pending: t("serviceOrders.status.pending"),
          in_progress: t("serviceOrders.status.inProgress"),
          completed: t("serviceOrders.status.completed"),
          cancelled: t("serviceOrders.status.cancelled"),
        };

        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
          >
            {statusText[status]}
          </span>
        );
      },
    }),
    columnHelper.accessor("scheduledDate", {
      header: t("serviceOrders.columns.scheduledDate"),
      cell: (info) => {
        const date = info.getValue();
        return (
          <div className="text-sm text-gray-900">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </div>
        );
      },
    }),
    columnHelper.accessor("completedDate", {
      header: t("serviceOrders.columns.completedDate"),
      cell: (info) => {
        const date = info.getValue();
        return (
          <div className="text-sm text-gray-900">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </div>
        );
      },
    }),
    columnHelper.accessor("description", {
      header: t("serviceOrders.columns.description"),
      cell: (info) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {info.getValue() || "-"}
        </div>
      ),
    }),
    columnHelper.accessor("attachments", {
      header: t("serviceOrders.columns.attachments"),
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor("maintenanceHistory", {
      header: t("serviceOrders.columns.maintenanceHistory"),
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor("createdAt", {
      header: t("serviceOrders.columns.created"),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("updatedAt", {
      header: t("serviceOrders.columns.updated"),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <div className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
              >
                <span className="sr-only">{t("common.options")}</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEditServiceOrder(info.row.original)}
                disabled={info.row.original.isOptimistic}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>{t("common.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteServiceOrder(info.row.original.id)}
                disabled={isMutating || info.row.original.isOptimistic}
                variant="destructive"
                className="flex items-center cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>
                  {info.row.original.optimisticOperation === "delete"
                    ? t("serviceOrders.deleting")
                    : isMutating
                      ? t("serviceOrders.deleting")
                      : t("common.delete")}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ] as ColumnDef<OptimisticServiceOrder>[];
}
