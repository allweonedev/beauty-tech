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
import { type Client } from "@/types/client";
import { type useTranslations } from "next-intl";

// Extended Client interface with optimistic flag
interface OptimisticClient extends Client {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

interface GetClientColumnsProps {
  t: ReturnType<typeof useTranslations>;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  isMutating?: boolean;
}

export function getClientColumns({
  t,
  onEditClient,
  onDeleteClient,
  isMutating = false,
}: GetClientColumnsProps): ColumnDef<OptimisticClient>[] {
  const columnHelper = createColumnHelper<OptimisticClient>();

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
    columnHelper.accessor("name", {
      header: t("clients.columns.name"),
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
                    <p>{t("clients.sync")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {info.row.original.cpf ?? "-"}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: t("clients.columns.contact"),
      cell: (info) => (
        <div>
          <div className="text-sm text-gray-900">{info.getValue() ?? "-"}</div>
          <div className="text-sm text-gray-500">
            {info.row.original.phone ?? "-"}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("address", {
      header: t("clients.columns.address"),
      cell: (info) => (
        <div className="text-sm text-gray-900">{info.getValue() ?? "-"}</div>
      ),
    }),
    columnHelper.accessor("birthDate", {
      header: t("clients.columns.birthDate"),
      cell: (info) => {
        const birthDate = info.getValue();
        return (
          <div className="text-sm text-gray-900">
            {birthDate ? new Date(birthDate).toLocaleDateString() : "-"}
          </div>
        );
      },
    }),
    columnHelper.accessor("source", {
      header: t("clients.columns.source"),
      cell: (info) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            info.getValue() === "manual"
              ? "bg-gray-100 text-gray-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {info.getValue() === "manual"
            ? t("clients.source.manual")
            : t("clients.source.smartLink")}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: t("clients.columns.created"),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("updatedAt", {
      header: t("clients.columns.updated"),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("documents", {
      header: t("clients.columns.documents"),
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor("notes", {
      header: t("clients.columns.notes"),
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor("interactions", {
      header: t("clients.columns.interactions"),
      cell: (info) => info.getValue().length,
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
                onClick={() => onEditClient(info.row.original)}
                disabled={info.row.original.isOptimistic}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>{t("common.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteClient(info.row.original.id)}
                disabled={isMutating || info.row.original.isOptimistic}
                variant="destructive"
                className="flex items-center cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>
                  {info.row.original.optimisticOperation === "delete"
                    ? t("clients.deleting")
                    : isMutating
                      ? t("clients.deleting")
                      : t("common.delete")}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ] as ColumnDef<OptimisticClient>[];
}
