import { type ColumnDef } from "@tanstack/react-table";
import {
  createSelectColumn,
  createActionsColumn,
  createDateColumn,
  createBadgeColumn,
} from "@/components/helper/table-column-helper";
import type { Product } from "@/types/product";
import { type useTranslations } from "next-intl";
import { useDeleteProduct } from "@/hooks/useProducts";

interface GetProductColumnsProps {
  t: ReturnType<typeof useTranslations>;
  onEditProduct?: (product: Product) => void;
  isMutating?: boolean;
}

export function getProductColumns({
  t,
  onEditProduct,
  isMutating = false,
}: GetProductColumnsProps): ColumnDef<Product>[] {
  const columns: ColumnDef<Product>[] = [
    // Selection column
    createSelectColumn<Product>(),

    // Name and type
    {
      accessorKey: "name",
      header: t("products.columns.name"),
      cell: (info) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {info.getValue<string>()}
          </div>
          <div className="text-sm text-gray-500">
            {info.row.original.type === "service"
              ? t("products.type.service")
              : t("products.type.equipment")}
          </div>
        </div>
      ),
    },

    // Description
    {
      accessorKey: "description",
      header: t("products.columns.description"),
      cell: (info) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {info.getValue<string>() || "-"}
        </div>
      ),
    },

    // Price
    {
      accessorKey: "price",
      header: t("products.columns.price"),
      cell: (info) => (
        <div className="text-sm text-gray-900">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(info.getValue<number>())}
        </div>
      ),
    },

    // Category
    {
      accessorKey: "category",
      header: t("products.columns.category"),
      cell: (info) => (
        <div className="text-sm text-gray-900">
          {info.getValue<string>() || "-"}
        </div>
      ),
    },

    // Application
    {
      accessorKey: "application",
      header: t("products.columns.application"),
      cell: (info) => (
        <div className="text-sm text-gray-900">
          {info.getValue<string>() || "-"}
        </div>
      ),
    },

    // Type badge
    createBadgeColumn<Product, "service" | "equipment">(
      "type",
      t("products.columns.type"),
      {
        getBadgeColor: (value) =>
          value === "service"
            ? "bg-blue-100 text-blue-800"
            : "bg-purple-100 text-purple-800",
        getLabel: (value) =>
          value === "service"
            ? t("products.type.service")
            : t("products.type.equipment"),
      }
    ),

    // Created date
    createDateColumn<Product>("createdAt", t("products.columns.created")),

    // Updated date
    createDateColumn<Product>("updatedAt", t("products.columns.updated")),

    // Actions column with self-contained delete functionality
    createActionsColumn<Product>({
      t: (key: string, options?: Record<string, unknown>) =>
        t(key, options as Record<string, string | number | Date> | undefined),
      onEditItem: onEditProduct,
      useDeleteHook: useDeleteProduct,
      isMutating,
      translationPrefix: "products",
    }),
  ];

  return columns;
}
