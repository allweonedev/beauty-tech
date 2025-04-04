import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Receipt,
} from "lucide-react";
import type { Sale } from "../../types/sales";

interface SalesListProps {
  onNewSale: () => void;
  onEditSale: (sale: Sale) => void;
}

export function SalesList({ onNewSale, onEditSale }: SalesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Sale["status"]>(
    "all"
  );

  // Mock data - replace with real data from your state management
  const sales: Sale[] = [
    {
      id: "1",
      clientId: "1",
      clientName: "Maria Silva",
      items: [
        {
          id: "1",
          productId: "1",
          name: "Serviço de Estética",
          quantity: 1,
          unitPrice: 150.0,
          total: 150.0,
        },
      ],
      total: 150.0,
      status: "pending",
      paymentMethod: "pix",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleSendReminder = async (e: React.MouseEvent, sale: Sale) => {
    e.stopPropagation(); // Prevent row click
    try {
      // In a real app, integrate with notification service
      alert(`Lembrete enviado para ${sale.clientName}`);
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Erro ao enviar lembrete. Tente novamente.");
    }
  };

  const handleGenerateReceipt = async (e: React.MouseEvent, sale: Sale) => {
    e.stopPropagation(); // Prevent row click
    try {
      // In a real app, generate receipt and update sale
      alert("Recibo gerado com sucesso!");
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Erro ao gerar recibo. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vendas</h3>
        <button
          onClick={onNewSale}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Nova Venda
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | Sale["status"])
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Itens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => onEditSale(sale)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.clientName}
                  </div>
                  <div className="text-sm text-gray-500">ID: {sale.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {sale.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(sale.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : sale.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {sale.status === "paid"
                      ? "Pago"
                      : sale.status === "pending"
                      ? "Pendente"
                      : "Cancelado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sale.paymentMethod === "pix"
                    ? "PIX"
                    : sale.paymentMethod === "credit"
                    ? "Crédito"
                    : sale.paymentMethod === "debit"
                    ? "Débito"
                    : "Dinheiro"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {sale.status === "pending" && (
                      <button
                        onClick={(e) => handleSendReminder(e, sale)}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors duration-150"
                        title="Enviar lembrete"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {sale.status === "paid" && !sale.receiptId && (
                      <button
                        onClick={(e) => handleGenerateReceipt(e, sale)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-150"
                        title="Gerar recibo"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
