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
import { type Product } from "@/types/product";

// Extended Product interface with optimistic flag
interface OptimisticProduct extends Product {
  isOptimistic?: boolean;
  optimisticOperation?: "create" | "update" | "delete";
}

interface GetProductColumnsProps {
  t: (key: string, params?: Record<string, string>) => string;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  isMutating?: boolean;
}

export function getProductColumns({
  t,
  onEditProduct,
  onDeleteProduct,
  isMutating = false,
}: GetProductColumnsProps): ColumnDef<OptimisticProduct>[] {
  const columnHelper = createColumnHelper<OptimisticProduct>();

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
      header: t("products.columns.name"),
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
                    <p>{t("products.sync")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {info.row.original.type === "service"
              ? t("products.type.service")
              : t("products.type.equipment")}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("description", {
      header: t("products.columns.description"),
      cell: (info) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {info.getValue() || "-"}
        </div>
      ),
    }),
    columnHelper.accessor("price", {
      header: t("products.columns.price"),
      cell: (info) => (
        <div className="text-sm text-gray-900">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor("category", {
      header: t("products.columns.category"),
      cell: (info) => (
        <div className="text-sm text-gray-900">{info.getValue() || "-"}</div>
      ),
    }),
    columnHelper.accessor("application", {
      header: t("products.columns.application"),
      cell: (info) => (
        <div className="text-sm text-gray-900">{info.getValue() || "-"}</div>
      ),
    }),
    columnHelper.accessor("type", {
      header: t("products.columns.type"),
      cell: (info) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            info.getValue() === "service"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {info.getValue() === "service"
            ? t("products.type.service")
            : t("products.type.equipment")}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: t("products.columns.created"),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("updatedAt", {
      header: t("products.columns.updated"),
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
                onClick={() => onEditProduct(info.row.original)}
                disabled={info.row.original.isOptimistic}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>{t("common.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteProduct(info.row.original.id)}
                disabled={isMutating || info.row.original.isOptimistic}
                variant="destructive"
                className="flex items-center cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>
                  {info.row.original.optimisticOperation === "delete"
                    ? t("products.deleting")
                    : isMutating
                      ? t("products.deleting")
                      : t("common.delete")}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ] as ColumnDef<OptimisticProduct>[];
}
