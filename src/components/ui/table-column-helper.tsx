import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { type UseMutationResult } from "@tanstack/react-query";
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
import { Edit, MoreVertical, RefreshCw } from "lucide-react";
import { DeleteButton } from "@/components/ui/delete-button";
import { type BaseEntity } from "@/components/ui/data-table";

// Column configuration interface
export interface ColumnConfig<
  TData extends BaseEntity,
  TError = Error,
  TContext = unknown,
> {
  t: ReturnType<
    (
      namespace?: string
    ) => (key: string, options?: Record<string, unknown>) => string
  >;
  onEditItem?: (item: TData) => void;
  useDeleteHook?: () => UseMutationResult<unknown, TError, string, TContext>;
  isMutating?: boolean;
  translationPrefix?: string;
  extraActions?: Array<{
    icon?: React.ReactNode;
    label: string;
    onClick: (item: TData) => void;
    disabled?: (item: TData) => boolean;
    className?: string;
  }>;
}

// Helper for creating select column
export function createSelectColumn<
  TData extends BaseEntity,
>(): ColumnDef<TData> {
  const columnHelper = createColumnHelper<TData>();

  return columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
        disabled={row.original.isOptimistic}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  });
}

// Helper for creating actions column
export function createActionsColumn<
  TData extends BaseEntity,
  TError = Error,
  TContext = unknown,
>({
  t,
  onEditItem,
  useDeleteHook,
  isMutating = false,
  translationPrefix = "common.table",
  extraActions = [],
}: ColumnConfig<TData, TError, TContext>): ColumnDef<TData> {
  const columnHelper = createColumnHelper<TData>();

  return columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => {
      // We need to render this conditionally since the hook will be called on render
      const DeleteComponent = useDeleteHook
        ? () => {
            const deleteHook = useDeleteHook();
            return (
              <DropdownMenuItem
                disabled={
                  info.row.original.isOptimistic ?? deleteHook.isPending
                }
                className="text-red-600"
              >
                <DeleteButton
                  item={info.row.original}
                  useDeleteHook={
                    useDeleteHook as () => UseMutationResult<
                      unknown,
                      Error,
                      string,
                      unknown
                    >
                  }
                  translationPrefix={translationPrefix}
                />
              </DropdownMenuItem>
            );
          }
        : null;

      return (
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
              {onEditItem && (
                <DropdownMenuItem
                  onClick={() => onEditItem(info.row.original)}
                  disabled={info.row.original.isOptimistic ?? isMutating}
                  className="flex items-center cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>{t("common.edit")}</span>
                </DropdownMenuItem>
              )}

              {/* Extra actions */}
              {extraActions.map((action, index) => (
                <DropdownMenuItem
                  key={`action-${index}`}
                  onClick={() => action.onClick(info.row.original)}
                  disabled={
                    (action.disabled
                      ? action.disabled(info.row.original)
                      : false) ??
                    info.row.original.isOptimistic ??
                    isMutating
                  }
                  className={`flex items-center cursor-pointer ${action.className ?? ""}`}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  <span>{action.label}</span>
                </DropdownMenuItem>
              ))}

              {/* Self-contained delete button */}
              {DeleteComponent && <DeleteComponent />}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  });
}

// Helper to create a standard date column
export function createDateColumn<TData extends BaseEntity>(
  accessor: keyof TData,
  header: string,
  options?: {
    dateFormat?: Intl.DateTimeFormatOptions;
    enableSorting?: boolean;
  }
): ColumnDef<TData> {
  const columnHelper = createColumnHelper<TData>();
  // Use type assertion to handle the accessor typing
  return columnHelper.accessor((row) => row[accessor], {
    id: accessor as string,
    header,
    cell: (info) => {
      const value = info.getValue();
      if (!value) return "-";

      const date =
        value instanceof Date ? value : new Date(value as string | number);

      return date.toLocaleDateString(
        undefined,
        options?.dateFormat ?? undefined
      );
    },
    enableSorting: options?.enableSorting !== false,
  }) as ColumnDef<TData>;
}

// Helper to create a standard status/badge column
export function createBadgeColumn<
  TData extends BaseEntity,
  TValue extends string = string,
>(
  accessor: keyof TData,
  header: string,
  options?: {
    getBadgeColor?: (value: TValue) => string;
    getLabel?: (value: TValue) => string;
    enableSorting?: boolean;
  }
): ColumnDef<TData> {
  const columnHelper = createColumnHelper<TData>();

  return columnHelper.accessor((row) => row[accessor], {
    id: accessor as string,
    header,
    cell: (info) => {
      const value = info.getValue() as TValue;
      if (!value) return "-";

      const label = options?.getLabel ? options.getLabel(value) : value;
      const colorClass = options?.getBadgeColor
        ? options.getBadgeColor(value)
        : "bg-gray-100 text-gray-800"; // Default styling

      return (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}
        >
          {label}
        </span>
      );
    },
    enableSorting: options?.enableSorting !== false,
  }) as ColumnDef<TData>;
}

// Helper to create a column with a primary and secondary text
export function createTwoLineColumn<TData extends BaseEntity>(
  primaryAccessor: keyof TData,
  secondaryAccessor: keyof TData,
  header: string,
  options?: {
    primaryFormatter?: (value: unknown) => React.ReactNode;
    secondaryFormatter?: (value: unknown) => React.ReactNode;
    enableSorting?: boolean;
  }
): ColumnDef<TData> {
  const columnHelper = createColumnHelper<TData>();

  return columnHelper.accessor((row) => row[primaryAccessor], {
    id: primaryAccessor as string,
    header,
    cell: (info) => {
      const primaryValue = info.getValue();
      const secondaryValue = info.row.original[secondaryAccessor];

      const formattedPrimary: React.ReactNode = options?.primaryFormatter
        ? options.primaryFormatter(primaryValue)
        : primaryValue != null
          ? String(primaryValue)
          : "-";

      const formattedSecondary: React.ReactNode = options?.secondaryFormatter
        ? options.secondaryFormatter(secondaryValue)
        : secondaryValue != null
          ? String(secondaryValue)
          : "-";

      return (
        <div>
          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
            {formattedPrimary}
            {info.row.original.isOptimistic && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-500 ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Syncing...</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-sm text-gray-500">{formattedSecondary}</div>
        </div>
      );
    },
    enableSorting: options?.enableSorting !== false,
  }) as ColumnDef<TData>;
}

// Helper to create a column for counting items in an array
export function createCountColumn<TData extends BaseEntity>(
  accessor: keyof TData,
  header: string,
  options?: {
    enableSorting?: boolean;
  }
): ColumnDef<TData> {
  const columnHelper = createColumnHelper<TData>();

  return columnHelper.accessor((row) => row[accessor], {
    id: accessor as string,
    header,
    cell: (info) => {
      const value = info.getValue();
      if (!value || !Array.isArray(value)) return 0;
      return value.length;
    },
    enableSorting: options?.enableSorting !== false,
  }) as ColumnDef<TData>;
}
