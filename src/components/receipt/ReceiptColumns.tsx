import React, { type ReactNode } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  createSelectColumn,
  createActionsColumn,
  createBadgeColumn,
  createDateColumn,
  createCurrencyColumn,
  createTwoLineColumn,
} from "@/components/helper/table-column-helper";
import type { Receipt } from "@/types/receipt";
import { type useTranslations } from "next-intl";
import { useDeleteReceipt } from "@/hooks/useReceipts";

interface GetReceiptColumnsProps {
  t: ReturnType<typeof useTranslations>;
  onEditReceipt?: (receipt: Receipt) => void;
  isMutating?: boolean;
}

// Extended Receipt type that includes API-populated fields
interface ReceiptWithRelations extends Receipt {
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export function getReceiptColumns({
  t,
  onEditReceipt,
  isMutating = false,
}: GetReceiptColumnsProps): ColumnDef<ReceiptWithRelations>[] {
  const columns: ColumnDef<ReceiptWithRelations>[] = [
    // Selection column
    createSelectColumn<ReceiptWithRelations>(),

    // Number and date
    createTwoLineColumn<ReceiptWithRelations>(
      "number",
      "date",
      t("receipts.columns.number"),
      {
        secondaryFormatter: (value: unknown): ReactNode =>
          value instanceof Date ? value.toLocaleDateString() : "-",
      }
    ),

    // Client info
    {
      id: "client",
      header: t("receipts.columns.client"),
      accessorFn: (row) => row.client?.name ?? row.clientId,
      cell: (info) => {
        const value = info.getValue<string>();
        return <div className="text-sm text-gray-900">{value ?? "-"}</div>;
      },
    },

    // Payment method
    createBadgeColumn<ReceiptWithRelations, string>(
      "paymentMethod",
      t("receipts.columns.paymentMethod"),
      {
        getBadgeColor: (value) => {
          switch (value) {
            case "cash":
              return "bg-green-100 text-green-800";
            case "credit_card":
              return "bg-blue-100 text-blue-800";
            case "debit_card":
              return "bg-cyan-100 text-cyan-800";
            case "bank_transfer":
              return "bg-purple-100 text-purple-800";
            case "pix":
              return "bg-indigo-100 text-indigo-800";
            case "installment":
              return "bg-yellow-100 text-yellow-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        },
        getLabel: (value) => {
          return t(`receipts.paymentMethods.${value}`);
        },
      }
    ),

    // Status
    createBadgeColumn<ReceiptWithRelations, string>(
      "status",
      t("receipts.columns.status"),
      {
        getBadgeColor: (value) => {
          switch (value) {
            case "draft":
              return "bg-gray-100 text-gray-800";
            case "issued":
              return "bg-blue-100 text-blue-800";
            case "paid":
              return "bg-green-100 text-green-800";
            case "overdue":
              return "bg-red-100 text-red-800";
            case "cancelled":
              return "bg-yellow-100 text-yellow-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        },
        getLabel: (value) => {
          return t(`receipts.status.${value}`);
        },
      }
    ),

    // Total
    createCurrencyColumn<ReceiptWithRelations>(
      "total",
      t("receipts.columns.total")
    ),

    // Due date
    createDateColumn<ReceiptWithRelations>(
      "dueDate",
      t("receipts.columns.dueDate")
    ),

    // Created date
    createDateColumn<ReceiptWithRelations>(
      "createdAt",
      t("receipts.columns.created")
    ),

    // Updated date
    createDateColumn<ReceiptWithRelations>(
      "updatedAt",
      t("receipts.columns.updated")
    ),

    // Items count
    {
      accessorFn: (row) => row.items?.length ?? 0,
      id: "itemsCount",
      header: t("receipts.columns.items"),
      cell: (info) => (
        <div className="text-sm text-gray-900">{info.getValue<number>()}</div>
      ),
    },

    // Actions column with self-contained delete functionality
    createActionsColumn<ReceiptWithRelations>({
      t: (key: string, options?: Record<string, unknown>) =>
        t(key, options as Record<string, string | number | Date> | undefined),
      onEditItem: onEditReceipt as (item: ReceiptWithRelations) => void,
      useDeleteHook: useDeleteReceipt, // This hook is directly used by the column
      isMutating,
      translationPrefix: "receipts",
    }),
  ];

  return columns;
}
