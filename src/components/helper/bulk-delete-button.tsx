import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { type UseMutationResult } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkDeleteButtonProps<TError = Error, TContext = unknown> {
  // The IDs to delete
  ids: string[];

  // The hook to use for bulk deletion (must return a TanStack Query mutation)
  useBulkDeleteHook: () => UseMutationResult<
    unknown,
    TError,
    string[], // Array of IDs param type
    TContext
  >;

  // Translation prefix for messages
  translationPrefix: string;

  // Optional callback after successful deletion
  onSuccess?: () => void;

  // Optional callback to clear selections
  onClearSelection?: () => void;
}

export function BulkDeleteButton({
  ids,
  useBulkDeleteHook,
  translationPrefix,
  onSuccess,
  onClearSelection,
}: BulkDeleteButtonProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Get the bulk delete mutation
  const bulkDeleteEntities = useBulkDeleteHook();

  // Only show if there are IDs to delete
  if (ids.length === 0) {
    return null;
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkDeleteEntities.mutateAsync(ids);

      toast({
        title: t(`${translationPrefix}.deleteItem`),
        description: t(`${translationPrefix}.deleteSuccess`),
      });

      // Clear selection after deletion
      if (onClearSelection) {
        onClearSelection();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`Error deleting ${translationPrefix}:`, error);

      toast({
        title: t("common.error"),
        description: t(`${translationPrefix}.deleteError`),
        variant: "destructive",
      });
    }

    setConfirmDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setConfirmDialogOpen(true)}
        disabled={bulkDeleteEntities.isPending}
        className="flex items-center gap-1"
      >
        <Trash className="w-4 h-4" />
        {t(`${translationPrefix}.deleteSelected`, {
          count: ids.length,
        })}
      </Button>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(`${translationPrefix}.deleteConfirm.title`)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${translationPrefix}.deleteConfirm.description`, {
                count: ids.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
