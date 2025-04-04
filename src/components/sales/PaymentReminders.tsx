import React, { useState } from "react";
import {
  Search,
  Filter,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { PaymentReminder } from "../../types/sales";

export function PaymentReminders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | PaymentReminder["status"]
  >("all");
  const [selectedReminder, setSelectedReminder] =
    useState<PaymentReminder | null>(null);

  // Mock data - replace with real data from your state management
  const reminders: PaymentReminder[] = [
    {
      id: "1",
      saleId: "1",
      clientName: "Maria Silva",
      amount: 150.0,
      sentAt: new Date(),
      scheduledFor: new Date(),
      status: "pending",
    },
  ];

  const handleResendReminder = async (
    e: React.MouseEvent,
    reminder: PaymentReminder
  ) => {
    e.stopPropagation(); // Prevent row click
    try {
      // In a real app, integrate with notification service
      alert(`Lembrete reenviado para ${reminder.clientName}`);
    } catch (error) {
      console.error("Error resending reminder:", error);
      alert("Erro ao reenviar lembrete. Tente novamente.");
    }
  };

  const handleReminderClick = (reminder: PaymentReminder) => {
    setSelectedReminder(reminder === selectedReminder ? null : reminder);
  };

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.clientName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || reminder.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lembretes de Pagamento</h3>
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
              setFilterStatus(
                e.target.value as "all" | PaymentReminder["status"]
              )
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="sent">Enviado</option>
            <option value="failed">Falhou</option>
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
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agendado para
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enviado em
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReminders.map((reminder) => (
              <React.Fragment key={reminder.id}>
                <tr
                  onClick={() => handleReminderClick(reminder)}
                  className={`group hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    selectedReminder?.id === reminder.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reminder.clientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Venda: {reminder.saleId}
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${
                          selectedReminder?.id === reminder.id
                            ? "rotate-90"
                            : ""
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(reminder.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reminder.scheduledFor).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reminder.sentAt
                      ? new Date(reminder.sentAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reminder.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : reminder.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {reminder.status === "sent"
                        ? "Enviado"
                        : reminder.status === "pending"
                        ? "Pendente"
                        : "Falhou"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(reminder.status === "pending" ||
                      reminder.status === "failed") && (
                      <button
                        onClick={(e) => handleResendReminder(e, reminder)}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full transition-colors duration-200"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Reenviar
                      </button>
                    )}
                  </td>
                </tr>
                {selectedReminder?.id === reminder.id && (
                  <tr className="bg-indigo-50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-2">
                        <p>
                          <strong>Detalhes do Lembrete</strong>
                        </p>
                        <p>Cliente: {reminder.clientName}</p>
                        <p>Venda: {reminder.saleId}</p>
                        <p>
                          Valor:{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(reminder.amount)}
                        </p>
                        <p>Status: {reminder.status}</p>
                        <p>
                          Agendado para:{" "}
                          {new Date(reminder.scheduledFor).toLocaleString()}
                        </p>
                        {reminder.sentAt && (
                          <p>
                            Enviado em:{" "}
                            {new Date(reminder.sentAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
