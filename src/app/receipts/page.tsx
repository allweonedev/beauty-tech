"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ReceiptsList } from "@/components/receipt/ReceiptsTable";
import { ReceiptModal } from "@/components/receipt/ReceiptModal";
import {
  usePaginatedReceipts,
  useCreateReceipt,
  useUpdateReceipt,
} from "@/hooks/useReceipts";
import type { Receipt } from "@/types/receipt";
import { useInView } from "react-intersection-observer";

export default function ReceiptsPage() {
  const t = useTranslations();
  const { ref, inView } = useInView();

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | undefined>(
    undefined
  );
  const [pageSize, setPageSize] = useState(10);

  // Fetch receipts with pagination
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePaginatedReceipts(pageSize);

  // Flatten pages of data for table
  const receipts = data?.pages.flatMap((page) => page.data) ?? [];

  // Create and update hooks
  const createReceipt = useCreateReceipt();
  const updateReceipt = useUpdateReceipt();

  // Load more data when scrolling to the bottom
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Handlers
  const handleNewReceipt = () => {
    setCurrentReceipt(undefined);
    setIsModalOpen(true);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setCurrentReceipt(receipt);
    setIsModalOpen(true);
  };

  const handleSaveReceipt = (receiptData: Partial<Receipt>) => {
    if (currentReceipt) {
      // Update existing receipt
      void updateReceipt.mutate({
        id: currentReceipt.id,
        data: receiptData,
      });
    } else {
      // Create new receipt
      void createReceipt.mutate(receiptData);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">{t("receipts.title")}</h1>

      <ReceiptsList
        receipts={receipts}
        onNewReceipt={handleNewReceipt}
        onEditReceipt={handleEditReceipt}
        isLoading={isLoading}
        isMutating={createReceipt.isPending || updateReceipt.isPending}
        hasMore={hasNextPage}
        onPageSizeChange={setPageSize}
        currentPageSize={pageSize}
      />

      {/* Loader reference for infinite scrolling */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center my-4">
          {isFetchingNextPage ? (
            <div className="my-4">{t("common.loading")}</div>
          ) : null}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={currentReceipt}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReceipt}
        open={isModalOpen}
        isMutating={createReceipt.isPending || updateReceipt.isPending}
      />
    </div>
  );
}
