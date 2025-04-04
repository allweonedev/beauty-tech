import React, { useState } from "react";
import { X, Users, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { PieChart, BarChart } from "@/components/ui/Charts";

interface LeadsModalProps {
  onClose: () => void;
  data: {
    newLeads: {
      value: number;
      pending: number;
      trend: string;
    };
  };
}

export function LeadsModal({ onClose, data }: LeadsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "funnel" | "sources">(
    "overview"
  );

  // Mock data - replace with real data from your state management
  const leadsData = {
    sources: {
      website: 35,
      socialMedia: 25,
      referral: 20,
      other: 20,
    },
    funnel: {
      newContact: 45,
      interested: 35,
      negotiation: 25,
      payment: 15,
      closed: 10,
    },
    status: {
      hot: 30,
      warm: 40,
      cold: 20,
      pending: 10,
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold">Análise de Leads</h2>
            <p className="text-sm text-gray-500">
              Visão geral e métricas detalhadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex gap-4 mb-6 sticky top-0 bg-white z-10 pb-4">
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
                onClick={() => setActiveTab("funnel")}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  activeTab === "funnel"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Funil de Vendas
              </button>
              <button
                onClick={() => setActiveTab("sources")}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  activeTab === "sources"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Origem dos Leads
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-red-50 rounded">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        Hot Leads
                      </span>
                    </div>
                    <div className="text-2xl font-semibold">
                      {leadsData.status.hot}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Alta prioridade de contato
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-50 rounded">
                        <Users className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        Warm Leads
                      </span>
                    </div>
                    <div className="text-2xl font-semibold">
                      {leadsData.status.warm}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Interesse demonstrado
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        Aguardando Contato
                      </span>
                    </div>
                    <div className="text-2xl font-semibold">
                      {data.newLeads.pending}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Leads não contatados
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">
                      Status dos Leads
                    </h3>
                    <PieChart
                      data={{
                        labels: ["Hot", "Warm", "Cold", "Aguardando"],
                        datasets: [
                          {
                            data: [
                              leadsData.status.hot,
                              leadsData.status.warm,
                              leadsData.status.cold,
                              leadsData.status.pending,
                            ],
                            backgroundColor: [
                              "#EF4444",
                              "#F59E0B",
                              "#3B82F6",
                              "#6B7280",
                            ],
                          },
                        ],
                      }}
                    />
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">
                      Tendência de Conversão
                    </h3>
                    <BarChart
                      data={{
                        labels: ["Hot", "Warm", "Cold"],
                        datasets: [
                          {
                            label: "Taxa de Conversão",
                            data: [75, 45, 15],
                            backgroundColor: "#4F46E5",
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "funnel" && (
              <div className="space-y-6">
                <div className="max-w-2xl mx-auto">
                  {Object.entries(leadsData.funnel).map(
                    ([stage, count], index) => (
                      <div
                        key={stage}
                        className="relative mb-4"
                        style={{
                          width: `${100 - index * 10}%`,
                          marginLeft: `${index * 5}%`,
                        }}
                      >
                        <div className="bg-indigo-600 text-white p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">
                              {stage.replace(/_/g, " ")}
                            </span>
                            <span>{count} leads</span>
                          </div>
                        </div>
                        {index <
                          Object.entries(leadsData.funnel).length - 1 && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                            <div className="w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-indigo-600 border-r-8 border-r-transparent" />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">
                    Métricas do Funil
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Taxa de Conversão</p>
                      <p className="text-2xl font-semibold text-green-600">
                        22%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tempo Médio no Funil
                      </p>
                      <p className="text-2xl font-semibold">7 dias</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valor Médio</p>
                      <p className="text-2xl font-semibold">R$ 1.500</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">
                      Origem dos Leads
                    </h3>
                    <PieChart
                      data={{
                        labels: [
                          "Website",
                          "Redes Sociais",
                          "Indicações",
                          "Outros",
                        ],
                        datasets: [
                          {
                            data: [
                              leadsData.sources.website,
                              leadsData.sources.socialMedia,
                              leadsData.sources.referral,
                              leadsData.sources.other,
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

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">
                      Desempenho por Origem
                    </h3>
                    <BarChart
                      data={{
                        labels: [
                          "Website",
                          "Redes Sociais",
                          "Indicações",
                          "Outros",
                        ],
                        datasets: [
                          {
                            label: "Taxa de Conversão",
                            data: [25, 18, 35, 15],
                            backgroundColor: "#4F46E5",
                          },
                        ],
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">
                    Detalhamento por Origem
                  </h3>
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Origem
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Leads
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Conversão
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Custo/Lead
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              ROI
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Tempo Médio
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              Website
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {leadsData.sources.website}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">25%</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              R$ 45,00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              320%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              3 dias
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              Redes Sociais
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {leadsData.sources.socialMedia}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">18%</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              R$ 35,00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              280%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              2 dias
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              Indicações
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {leadsData.sources.referral}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">35%</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              R$ 0,00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">∞</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              1 dia
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              Outros
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {leadsData.sources.other}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">15%</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              R$ 25,00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              180%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              4 dias
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
