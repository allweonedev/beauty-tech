import React, { useState } from "react";
import type { Supplier } from "../../types/suppliers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SupplierModalProps {
  supplier?: Supplier;
  onClose: () => void;
  onSave: (supplier: Partial<Supplier>) => void;
  open: boolean;
}

export function SupplierModal({
  supplier,
  onClose,
  onSave,
  open,
}: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: supplier?.name ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
    cnpj: supplier?.cnpj ?? "",
    address: supplier?.address ?? "",
    type: supplier?.type ?? "partner",
    commission: {
      percentage: supplier?.commission.percentage ?? 10,
      minimumValue: supplier?.commission.minimumValue ?? 0,
      maximumValue: supplier?.commission.maximumValue ?? 0,
    },
    bankInfo: {
      bank: supplier?.bankInfo.bank ?? "",
      agency: supplier?.bankInfo.agency ?? "",
      account: supplier?.bankInfo.account ?? "",
      type: supplier?.bankInfo.type ?? "checking",
      pixKey: supplier?.bankInfo.pixKey ?? "",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...supplier,
      ...formData,
      updatedAt: new Date(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) =>
                  setFormData({ ...formData, cnpj: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Supplier["type"],
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="partner">Parceiro</option>
                <option value="subcontractor">Sublocado</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Comissão</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Percentual (%)
                </label>
                <input
                  type="number"
                  value={formData.commission.percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission: {
                        ...formData.commission,
                        percentage: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor Mínimo (R$)
                </label>
                <input
                  type="number"
                  value={formData.commission.minimumValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission: {
                        ...formData.commission,
                        minimumValue: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor Máximo (R$)
                </label>
                <input
                  type="number"
                  value={formData.commission.maximumValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission: {
                        ...formData.commission,
                        maximumValue: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Dados Bancários
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Banco
                </label>
                <input
                  type="text"
                  value={formData.bankInfo.bank}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: {
                        ...formData.bankInfo,
                        bank: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Conta
                </label>
                <select
                  value={formData.bankInfo.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: {
                        ...formData.bankInfo,
                        type: e.target.value as "checking" | "savings",
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="checking">Corrente</option>
                  <option value="savings">Poupança</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Agência
                </label>
                <input
                  type="text"
                  value={formData.bankInfo.agency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: {
                        ...formData.bankInfo,
                        agency: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Conta
                </label>
                <input
                  type="text"
                  value={formData.bankInfo.account}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: {
                        ...formData.bankInfo,
                        account: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={formData.bankInfo.pixKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankInfo: {
                        ...formData.bankInfo,
                        pixKey: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Salvar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
