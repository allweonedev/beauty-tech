/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { type ReactNode } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  createSelectColumn,
  createActionsColumn,
  createDateColumn,
  createBadgeColumn,
} from "@/components/helper/table-column-helper";
import { type ServiceOrder } from "./ServiceOrderModal";
import { type useTranslations } from "next-intl";
import { useDeleteServiceOrder } from "@/hooks/useServiceOrders";

interface GetServiceOrderColumnsProps {
  t: ReturnType<typeof useTranslations>;
  onEditServiceOrder?: (serviceOrder: ServiceOrder) => void;
  isMutating?: boolean;
}

export function getServiceOrderColumns({
  t,
  onEditServiceOrder,
  isMutating = false,
}: GetServiceOrderColumnsProps): ColumnDef<ServiceOrder>[] {
  const columns: ColumnDef<ServiceOrder>[] = [
    // Selection column
    createSelectColumn<ServiceOrder>(),

    // Number and client
    {
      accessorKey: "number",
      header: t("serviceOrders.columns.number"),
      cell: (info) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {info.getValue<string>()}
          </div>
          <div className="text-sm text-gray-500">
            {info.row.original.client?.name ?? "-"}
          </div>
        </div>
      ),
    },

    // Status badge
    createBadgeColumn<
      ServiceOrder,
      "pending" | "in_progress" | "completed" | "cancelled"
    >("status", t("serviceOrders.columns.status"), {
      getBadgeColor: (value) => {
        switch (value) {
          case "pending":
            return "bg-yellow-100 text-yellow-800";
          case "in_progress":
            return "bg-blue-100 text-blue-800";
          case "completed":
            return "bg-green-100 text-green-800";
          case "cancelled":
            return "bg-red-100 text-red-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      },
      getLabel: (value) => {
        switch (value) {
          case "pending":
            return t("serviceOrders.status.pending");
          case "in_progress":
            return t("serviceOrders.status.inProgress");
          case "completed":
            return t("serviceOrders.status.completed");
          case "cancelled":
            return t("serviceOrders.status.cancelled");
          default:
            return value;
        }
      },
    }),

    // Description
    {
      accessorKey: "description",
      header: t("serviceOrders.columns.description"),
      cell: (info) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {info.getValue<string>() || "-"}
        </div>
      ),
    },

    // Scheduled date
    createDateColumn<ServiceOrder>(
      "scheduledDate",
      t("serviceOrders.columns.scheduledDate")
    ),

    // Completion date
    createDateColumn<ServiceOrder>(
      "completedDate",
      t("serviceOrders.columns.completedDate")
    ),

    // Created date
    createDateColumn<ServiceOrder>(
      "createdAt",
      t("serviceOrders.columns.created")
    ),

    // Updated date
    createDateColumn<ServiceOrder>(
      "updatedAt",
      t("serviceOrders.columns.updated")
    ),

    // Actions column with self-contained delete functionality
    createActionsColumn<ServiceOrder>({
      t: (key: string, options?: Record<string, unknown>) =>
        t(key, options as Record<string, string | number | Date> | undefined),
      onEditItem: onEditServiceOrder,
      useDeleteHook: useDeleteServiceOrder,
      isMutating,
      translationPrefix: "serviceOrders",
    }),
  ];

  return columns;
}
