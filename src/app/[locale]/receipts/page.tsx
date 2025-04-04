"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ReceiptsList } from "@/components/receipt/ReceiptsTable";
import { ReceiptModal } from "@/components/receipt/ReceiptModal";
import { useToast } from "@/components/ui/use-toast";
import {
  usePaginatedReceipts,
  useCreateReceipt,
  useUpdateReceipt,
  useDeleteReceipt,
  useBulkDeleteReceipts,
} from "@/hooks/useReceipts";
import type { Receipt } from "@/types/receipt";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ReceiptsPage() {
  const router = useRouter();
  const t = useTranslations();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | undefined>();
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch receipts data
  const { data: receiptsData, isLoading } = usePaginatedReceipts(
    pageSize,
    currentPage
  );

  // Generate flat list of clients from paginated data
  const receipts = React.useMemo(() => {
    if (!receiptsData) return [];
    return receiptsData.pages.flatMap((page) => page.data as Receipt[]);
  }, [receiptsData]);

  // Get the total count from the latest page
  const totalCount = React.useMemo(() => {
    if (!receiptsData?.pages || receiptsData.pages.length === 0) return 0;
    return receiptsData.pages[0].totalCount;
  }, [receiptsData]);

  // Mutations
  const createReceipt = useCreateReceipt();
  const updateReceipt = useUpdateReceipt();
  const deleteReceipt = useDeleteReceipt();
  const bulkDeleteReceipts = useBulkDeleteReceipts();

  // Handle receipt creation and updates
  const handleSaveReceipt = (receiptData: Partial<Receipt>) => {
    if (selectedReceipt) {
      // Update existing receipt
      updateReceipt.mutate(
        {
          id: selectedReceipt.id,
          data: receiptData,
        },
        {
          onSuccess: () => {
            toast({
              title: t("receipts.editReceipt"),
              description: t("receipts.editSuccess"),
            });
          },
          onError: () => {
            toast({
              title: t("common.error"),
              description: t("receipts.editError"),
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create new receipt
      createReceipt.mutate(receiptData, {
        onSuccess: () => {
          toast({
            title: t("receipts.newReceipt"),
            description: t("receipts.createSuccess"),
          });
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("receipts.createError"),
            variant: "destructive",
          });
        },
      });
    }

    // Close modal
    setShowReceiptModal(false);
    setSelectedReceipt(undefined);
  };

  // Is any mutation in progress?
  const isMutating =
    createReceipt.isPending ||
    updateReceipt.isPending ||
    deleteReceipt.isPending ||
    bulkDeleteReceipts.isPending;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1
                onClick={() => router.push("/")}
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
              >
                {t("home.title")}
              </h1>
              <span className="mx-2">›</span>
              <div className="text-lg font-medium text-gray-700">
                {t("receipts.title")}
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ReceiptsList
          receipts={receipts}
          isLoading={isLoading}
          isMutating={isMutating}
          onNewReceipt={() => {
            setSelectedReceipt(undefined);
            setShowReceiptModal(true);
          }}
          onEditReceipt={(receipt: Receipt) => {
            setSelectedReceipt(receipt);
            setShowReceiptModal(true);
          }}
          onPageSizeChange={setPageSize}
          currentPageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={currentPage}
        />
      </main>

      <ReceiptModal
        receipt={selectedReceipt}
        open={showReceiptModal}
        isMutating={isMutating}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedReceipt(undefined);
        }}
        onSave={handleSaveReceipt}
      />
    </div>
  );
}
