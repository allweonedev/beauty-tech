import React, { type ReactNode } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  createSelectColumn,
  createActionsColumn,
  createTwoLineColumn,
  createDateColumn,
  createBadgeColumn,
  createCountColumn,
} from "@/components/helper/table-column-helper";
import type { Client } from "@/types/client";
import { type useTranslations } from "next-intl";
import { useDeleteClient } from "@/hooks/useClients";

interface GetClientColumnsProps {
  t: ReturnType<typeof useTranslations>;
  onEditClient?: (client: Client) => void;
  isMutating?: boolean;
}

export function getClientColumns({
  t,
  onEditClient,
  isMutating = false,
}: GetClientColumnsProps): ColumnDef<Client>[] {
  const columns: ColumnDef<Client>[] = [
    // Selection column
    createSelectColumn<Client>(),

    // Name and CPF
    createTwoLineColumn<Client>("name", "cpf", t("clients.columns.name"), {
      secondaryFormatter: (value: unknown): ReactNode =>
        typeof value === "string" ? value : "-",
    }),

    // Contact info
    createTwoLineColumn<Client>(
      "email",
      "phone",
      t("clients.columns.contact"),
      {
        primaryFormatter: (value: unknown): ReactNode =>
          value !== null && value !== undefined ? String(value) : "-",
        secondaryFormatter: (value: unknown): ReactNode =>
          value !== null && value !== undefined ? String(value) : "-",
      }
    ),

    // Address
    {
      accessorFn: (row) => row.address,
      id: "address",
      header: t("clients.columns.address"),
      cell: (info) => {
        const value = info.getValue<string | null | undefined>();
        return <div className="text-sm text-gray-900">{value ?? "-"}</div>;
      },
    },

    // Birth date
    createDateColumn<Client>("birthDate", t("clients.columns.birthDate")),

    // Source
    createBadgeColumn<Client, "manual" | "smart-link">(
      "source",
      t("clients.columns.source"),
      {
        getBadgeColor: (value) =>
          value === "manual"
            ? "bg-gray-100 text-gray-800"
            : "bg-green-100 text-green-800",
        getLabel: (value) =>
          value === "manual"
            ? t("clients.source.manual")
            : t("clients.source.smartLink"),
      }
    ),

    // Created date
    createDateColumn<Client>("createdAt", t("clients.columns.created")),

    // Updated date
    createDateColumn<Client>("updatedAt", t("clients.columns.updated")),

    // Document count
    createCountColumn<Client>("documents", t("clients.columns.documents")),

    // Notes count
    createCountColumn<Client>("notes", t("clients.columns.notes")),

    // Interactions count
    createCountColumn<Client>(
      "interactions",
      t("clients.columns.interactions")
    ),

    // Actions column with self-contained delete functionality
    createActionsColumn<Client>({
      t: (key: string, options?: Record<string, unknown>) =>
        t(key, options as Record<string, string | number | Date> | undefined),
      onEditItem: onEditClient,
      useDeleteHook: useDeleteClient, // This hook is directly used by the column
      isMutating,
      translationPrefix: "clients",
    }),
  ];

  return columns;
}
