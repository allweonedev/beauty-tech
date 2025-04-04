import React, { useState } from "react";
import { X, Save, Wallet, Loader2, Copy, QrCode } from "lucide-react";

interface PaymentLinkModalProps {
  onClose: () => void;
  onSave: (paymentData: {
    amount: number;
    description: string;
    expiresIn: number;
  }) => Promise<{ link: string; qrCode: string }>;
  isSaving: boolean;
}

export function PaymentLinkModal({
  onClose,
  onSave,
  isSaving,
}: PaymentLinkModalProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    description: "",
    expiresIn: 24, // hours
  });

  const [generatedLink, setGeneratedLink] = useState("");
  const [qrCode, setQrCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await onSave(formData);
      setGeneratedLink(result.link);
      setQrCode(result.qrCode);
    } catch (error) {
      // Error is handled in parent component
    }
  };

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(generatedLink);
    alert("Link copiado para a área de transferência!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold">Gerar Link PIX</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expira em (horas)
              </label>
              <input
                type="number"
                value={formData.expiresIn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiresIn: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                min="1"
                max="72"
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Gerando..." : "Gerar Link"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Link PIX
                </span>
                <button
                  onClick={handleCopyLink}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copiar</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 break-all">{generatedLink}</p>
            </div>

            {qrCode && (
              <div className="flex flex-col items-center gap-4">
                <QrCode className="w-32 h-32 text-gray-900" />
                <button
                  onClick={() => {
                    // Download QR Code
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Download QR Code
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
