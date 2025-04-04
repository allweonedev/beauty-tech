import React, { useState } from "react";
import {
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  ChevronRight,
  Users,
  Package,
} from "lucide-react";
import { BarChart, LineChart, PieChart } from "../ui/Charts";

interface SalesAnalysisModalProps {
  onClose: () => void;
  data: {
    dailySales: {
      value: number;
      trend: string;
    };
  };
}

export function SalesAnalysisModal({ onClose, data }: SalesAnalysisModalProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "projections"
  >("overview");

  // Mock data - replace with real data from your state management
  const salesData = {
    hourly: [
      { hour: "08:00", value: 250 },
      { hour: "09:00", value: 450 },
      { hour: "10:00", value: 850 },
      { hour: "11:00", value: 1200 },
      { hour: "12:00", value: 750 },
      { hour: "13:00", value: 650 },
      { hour: "14:00", value: 950 },
      { hour: "15:00", value: 1100 },
      { hour: "16:00", value: 850 },
      { hour: "17:00", value: 750 },
      { hour: "18:00", value: 550 },
      { hour: "19:00", value: 350 },
    ],
    products: {
      services: 45,
      equipment: 30,
      products: 25,
    },
    paymentMethods: {
      pix: 40,
      credit: 35,
      debit: 15,
      cash: 10,
    },
    projections: {
      daily: [3450, 3600, 3800, 3900, 4000, 4200, 4500],
      monthly: [95000, 98000, 102000, 105000, 108000, 112000],
      yearly: [1150000, 1200000, 1250000, 1300000],
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold">Análise de Vendas</h2>
            <p className="text-sm text-gray-500">
              Vendas do dia: R$ {data.dailySales.value.toLocaleString()} •{" "}
              {data.dailySales.trend} que ontem
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                activeTab === "products"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Produtos e Serviços
            </button>
            <button
              onClick={() => setActiveTab("projections")}
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                activeTab === "projections"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Projeções
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-50 rounded">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Ticket Médio
                    </span>
                  </div>
                  <div className="text-2xl font-semibold">R$ 450,00</div>
                  <p className="text-sm text-gray-500 mt-1">+15% que ontem</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Total de Clientes
                    </span>
                  </div>
                  <div className="text-2xl font-semibold">32</div>
                  <p className="text-sm text-gray-500 mt-1">+8% que ontem</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 rounded">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Itens Vendidos
                    </span>
                  </div>
                  <div className="text-2xl font-semibold">45</div>
                  <p className="text-sm text-gray-500 mt-1">+12% que ontem</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Vendas por Hora</h3>
                  <LineChart
                    data={{
                      labels: salesData.hourly.map((item) => item.hour),
                      datasets: [
                        {
                          label: "Vendas (R$)",
                          data: salesData.hourly.map((item) => item.value),
                          borderColor: "#4F46E5",
                          tension: 0.4,
                        },
                      ],
                    }}
                  />
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">
                    Métodos de Pagamento
                  </h3>
                  <PieChart
                    data={{
                      labels: ["PIX", "Crédito", "Débito", "Dinheiro"],
                      datasets: [
                        {
                          data: [
                            salesData.paymentMethods.pix,
                            salesData.paymentMethods.credit,
                            salesData.paymentMethods.debit,
                            salesData.paymentMethods.cash,
                          ],
                          backgroundColor: [
                            "#4F46E5",
                            "#10B981",
                            "#F59E0B",
                            "#6B7280",
                          ],
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">
                    Distribuição de Vendas
                  </h3>
                  <PieChart
                    data={{
                      labels: ["Serviços", "Equipamentos", "Produtos"],
                      datasets: [
                        {
                          data: [
                            salesData.products.services,
                            salesData.products.equipment,
                            salesData.products.products,
                          ],
                          backgroundColor: ["#4F46E5", "#10B981", "#F59E0B"],
                        },
                      ],
                    }}
                  />
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Top Produtos</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Limpeza de Pele", value: 1200, quantity: 8 },
                      { name: "Massagem Relaxante", value: 900, quantity: 6 },
                      { name: "Hidratação Facial", value: 750, quantity: 5 },
                      { name: "Depilação", value: 600, quantity: 4 },
                      { name: "Manicure", value: 450, quantity: 3 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} vendas
                          </p>
                        </div>
                        <span className="font-medium text-green-600">
                          R$ {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">
                  Desempenho por Categoria
                </h3>
                <BarChart
                  data={{
                    labels: [
                      "Facial",
                      "Corporal",
                      "Capilar",
                      "Estética",
                      "Outros",
                    ],
                    datasets: [
                      {
                        label: "Vendas (R$)",
                        data: [4500, 3800, 3200, 2800, 1500],
                        backgroundColor: "#4F46E5",
                      },
                    ],
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "projections" && (
            <div className="space-y-6">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setPeriod("day")}
                  className={`px-4 py-2 text-sm font-medium rounded-full ${
                    period === "day"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Diário
                </button>
                <button
                  onClick={() => setPeriod("week")}
                  className={`px-4 py-2 text-sm font-medium rounded-full ${
                    period === "week"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setPeriod("month")}
                  className={`px-4 py-2 text-sm font-medium rounded-full ${
                    period === "month"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Mensal
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Projeção de Vendas</h3>
                <LineChart
                  data={{
                    labels:
                      period === "day"
                        ? ["Hoje", "+1", "+2", "+3", "+4", "+5", "+6"]
                        : period === "week"
                        ? ["Esta Semana", "+1", "+2", "+3", "+4", "+5", "+6"]
                        : ["Este Mês", "+1", "+2", "+3", "+4", "+5"],
                    datasets: [
                      {
                        label: "Vendas Projetadas (R$)",
                        data:
                          period === "day"
                            ? salesData.projections.daily
                            : period === "week"
                            ? salesData.projections.monthly
                            : salesData.projections.yearly,
                        borderColor: "#4F46E5",
                        tension: 0.4,
                      },
                    ],
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">
                    Crescimento Esperado
                  </h3>
                  <div className="text-3xl font-bold text-green-600">+15%</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Comparado ao período anterior
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Meta do Período</h3>
                  <div className="text-3xl font-bold text-indigo-600">85%</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Do objetivo alcançado
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Tendência</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    Positiva
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Baseado nos últimos 30 dias
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
