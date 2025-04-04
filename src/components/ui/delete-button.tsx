import React from "react";
import { useTranslations } from "next-intl";
import { Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { type UseMutationResult } from "@tanstack/react-query";

interface DeleteButtonProps<
  T extends { id: string; optimisticOperation?: string },
  TError = Error,
  TContext = unknown,
> {
  // The item to delete
  item: T;

  // The hook to use for deletion (must return a TanStack Query mutation)
  useDeleteHook: () => UseMutationResult<
    unknown,
    TError,
    string, // ID param type
    TContext
  >;

  // Translation prefix for messages
  translationPrefix: string;

  // Optional className for styling
  className?: string;

  // Optional custom confirm message key
  confirmMessageKey?: string;

  // Optional callback after successful deletion
  onSuccess?: () => void;
}

export function DeleteButton<
  T extends { id: string; optimisticOperation?: string },
>({
  item,
  useDeleteHook,
  translationPrefix,
  className = "",
  confirmMessageKey,
  onSuccess,
}: DeleteButtonProps<T>) {
  const t = useTranslations();
  const { toast } = useToast();

  // Get the delete mutation
  const deleteEntity = useDeleteHook();

  // Handle delete with confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Get the appropriate confirmation message
    const confirmMessage = confirmMessageKey
      ? t(confirmMessageKey)
      : t(`${translationPrefix}.deleteConfirm.message`);

    if (confirm(confirmMessage)) {
      deleteEntity.mutate(item.id, {
        onSuccess: () => {
          toast({
            title: t(`${translationPrefix}.deleteItem`),
            description: t(`${translationPrefix}.deleteSuccess`),
          });

          if (onSuccess) {
            onSuccess();
          }
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t(`${translationPrefix}.deleteError`),
            variant: "destructive",
          });
        },
      });
    }
  };

  // Determine the label based on deletion state
  const getButtonLabel = () => {
    if (item.optimisticOperation === "delete") {
      return t(`${translationPrefix}.deleting`);
    }

    if (deleteEntity.isPending) {
      return t(`${translationPrefix}.deleting`);
    }

    return t("common.delete");
  };

  return (
    <div
      className={`flex items-center cursor-pointer text-red-600 ${className}`}
      onClick={handleDelete}
    >
      <Trash className="mr-2 h-4 w-4" />
      <span>{getButtonLabel()}</span>
    </div>
  );
}
