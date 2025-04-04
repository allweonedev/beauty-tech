import React, { useState } from "react";
import { Download, Calendar, Filter, DollarSign, BarChart } from "lucide-react";
import type { CommissionReport } from "../../types/suppliers";

export function CommissionReports() {
  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all");

  // Mock data - replace with real data from your state management
  const reports: CommissionReport[] = [
    {
      period: {
        start: new Date(2024, 1, 1),
        end: new Date(2024, 1, 31),
      },
      supplier: {
        id: "1",
        name: "Equipamentos Premium Ltda",
      },
      rentals: [],
      summary: {
        totalRentals: 15,
        totalValue: 22500.0,
        totalCommission: 3375.0,
        pendingCommission: 450.0,
        paidCommission: 2925.0,
      },
    },
  ];

  const handleExportReport = () => {
    // In a real app, generate and download report
    alert("Relatório exportado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Relatório de Comissões</h3>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
        >
          <Download className="w-5 h-5" />
          Exportar Relatório
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
          <option value="custom">Personalizado</option>
        </select>

        {period === "custom" && (
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Fornecedores</option>
            {reports.map((report) => (
              <option key={report.supplier.id} value={report.supplier.id}>
                {report.supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.supplier.id}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {report.supplier.name}
              </h4>
              <span className="text-sm text-gray-500">
                {new Date(report.period.start).toLocaleDateString()} -{" "}
                {new Date(report.period.end).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Locações</span>
                <span className="text-lg font-semibold">
                  {report.summary.totalRentals}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor Total</span>
                <span className="text-lg font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(report.summary.totalValue)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Comissão Total</span>
                <span className="text-lg font-semibold text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(report.summary.totalCommission)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Comissão Paga</span>
                  <span className="text-sm font-medium text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(report.summary.paidCommission)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Comissão Pendente
                  </span>
                  <span className="text-sm font-medium text-yellow-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(report.summary.pendingCommission)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
