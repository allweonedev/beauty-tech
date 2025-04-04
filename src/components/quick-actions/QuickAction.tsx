import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ClientQuickAddModal } from "./ClientQuickAddModal";
import { ServiceOrderQuickAddModal } from "./ServiceOrderQuickAddModal";
import { ReceiptQuickAddModal } from "./ReceiptQuickAddModal";
import { PaymentLinkModal } from "./PaymentLinkModal";
import type { ReceiptData } from "@/components/receipt/Receipt";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  notification?: number;
  onClick?: () => void;
}

export function QuickAction({
  icon: Icon,
  label,
  notification,
  onClick,
}: QuickActionProps) {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceOrderModal, setShowServiceOrderModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = () => {
    switch (label) {
      case "+ Cliente":
        setShowClientModal(true);
        break;
      case "+ O.S.":
        setShowServiceOrderModal(true);
        break;
      case "Emitir Recibo":
        setShowReceiptModal(true);
        break;
      case "Gerar LinkPix":
        setShowPaymentLinkModal(true);
        break;
      default:
        onClick?.();
    }
  };

  const handleSaveClient = async (clientData: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  }) => {
    try {
      setIsSaving(true);
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Erro ao cadastrar cliente. Por favor, tente novamente.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveServiceOrder = async (orderData: {
    title: string;
    client: string;
    service: string;
    description: string;
  }) => {
    try {
      setIsSaving(true);
      // In a real app, save to database
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Ordem de serviço criada com sucesso!");
      setShowServiceOrderModal(false);
      return orderData;
    } catch (error) {
      console.error("Error creating service order:", error);
      alert("Erro ao criar ordem de serviço. Por favor, tente novamente.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReceipt = async (receiptData: ReceiptData) => {
    try {
      setIsSaving(true);
      // In a real app, save to database
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Recibo gerado com sucesso!");
      setShowReceiptModal(false);
      return receiptData;
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Erro ao gerar recibo. Por favor, tente novamente.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePaymentLink = async (paymentData: {
    amount: number;
    description: string;
    expiresIn: number;
  }) => {
    try {
      setIsSaving(true);
      // In a real app, integrate with payment gateway
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response
      const mockResponse = {
        link: "https://pix.example.com/123456",
        qrCode: "data:image/png;base64,abc123...",
      };

      setShowPaymentLinkModal(false);
      return mockResponse;
    } catch (error) {
      console.error("Error generating payment link:", error);
      alert("Erro ao gerar link de pagamento. Por favor, tente novamente.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors relative w-full"
        onClick={handleClick}
      >
        <div className="relative">
          <Icon className="w-6 h-6 text-indigo-600" />
          {notification && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {notification}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </button>

      {showClientModal && (
        <ClientQuickAddModal
          onClose={() => setShowClientModal(false)}
          onSave={handleSaveClient}
          isSaving={isSaving}
        />
      )}

      {showServiceOrderModal && (
        <ServiceOrderQuickAddModal
          onClose={() => setShowServiceOrderModal(false)}
          onSave={handleSaveServiceOrder}
          isSaving={isSaving}
        />
      )}

      {showReceiptModal && (
        <ReceiptQuickAddModal
          onClose={() => setShowReceiptModal(false)}
          onSave={handleSaveReceipt}
          isSaving={isSaving}
        />
      )}

      {showPaymentLinkModal && (
        <PaymentLinkModal
          onClose={() => setShowPaymentLinkModal(false)}
          onSave={handleGeneratePaymentLink}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
