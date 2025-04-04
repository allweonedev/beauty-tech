"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { ReceiptsList } from "@/components/receipt/ReceiptsList";
import {
  ReceiptComponent,
  type ReceiptData,
} from "@/components/receipt/Receipt";

export default function ReceiptsPage() {
  const router = useRouter();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<
    ReceiptData | undefined
  >();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <h1
              onClick={() => router.push("/")}
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              Beauty Tech
            </h1>
            <span className="mx-2">›</span>
            <h2 className="text-lg font-medium text-gray-700">Recibos</h2>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ReceiptsList
          receipts={receipts}
          onViewReceipt={(receipt) => {
            setSelectedReceipt(receipt);
            setShowReceiptModal(true);
          }}
        />
      </main>

      {showReceiptModal && selectedReceipt && (
        <ReceiptComponent
          data={selectedReceipt}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReceipt(undefined);
          }}
        />
      )}
    </div>
  );
}
