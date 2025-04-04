import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Play,
  Pause,
  BarChart2,
  Copy,
} from "lucide-react";
import type { Campaign } from "../../types/campaigns";

interface CampaignsListProps {
  onNewCampaign: () => void;
  onEditCampaign: (campaign: Campaign) => void;
}

export function CampaignsList({
  onNewCampaign,
  onEditCampaign,
}: CampaignsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | Campaign["type"]>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Campaign["status"]>(
    "all"
  );

  // Mock data - replace with real data from your state management
  const campaigns: Campaign[] = [
    {
      id: "1",
      name: "Reengajamento de Leads",
      type: "whatsapp",
      status: "running",
      segment: {
        type: "inactive_leads",
        conditions: [
          {
            field: "lastActivity",
            operator: "less_than",
            value: "30d",
          },
        ],
      },
      content: {
        whatsapp: {
          id: "1",
          name: "Reengajamento",
          content:
            "Olá {name}! Sentimos sua falta! Que tal conhecer nossas novidades?",
          variables: ["name"],
          buttons: [
            {
              type: "url",
              text: "Ver Novidades",
              value: "https://example.com/novidades",
            },
          ],
        },
      },
      schedule: {
        startDate: new Date(),
        frequency: "daily",
        timeSlots: ["10:00", "15:00"],
      },
      analytics: {
        sent: 250,
        delivered: 245,
        opened: 180,
        clicked: 45,
        responded: 30,
        converted: 15,
      },
      aiSettings: {
        enabled: true,
        personalization: true,
        optimization: true,
        responseHandling: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleDuplicate = async (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    // Handle campaign duplication
    alert("Campanha duplicada com sucesso!");
  };

  const handleToggleStatus = async (
    e: React.MouseEvent,
    campaign: Campaign
  ) => {
    e.stopPropagation();
    // Handle campaign status toggle
    alert(
      `Campanha ${
        campaign.status === "running" ? "pausada" : "iniciada"
      } com sucesso!`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Campanhas</h3>
        <button
          onClick={onNewCampaign}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Nova Campanha
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "all" | Campaign["type"])
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="multi-channel">Multi-canal</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | Campaign["status"])
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="scheduled">Agendada</option>
            <option value="running">Em Execução</option>
            <option value="completed">Concluída</option>
            <option value="paused">Pausada</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campanha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Segmento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Desempenho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                onClick={() => onEditCampaign(campaign)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {campaign.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Criada em{" "}
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.type === "whatsapp"
                        ? "bg-green-100 text-green-800"
                        : campaign.type === "email"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {campaign.type === "whatsapp"
                      ? "WhatsApp"
                      : campaign.type === "email"
                      ? "Email"
                      : "Multi-canal"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.segment.type === "active_clients"
                        ? "bg-blue-100 text-blue-800"
                        : campaign.segment.type === "inactive_leads"
                        ? "bg-yellow-100 text-yellow-800"
                        : campaign.segment.type === "vip_clients"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.segment.type === "active_clients"
                      ? "Clientes Ativos"
                      : campaign.segment.type === "inactive_leads"
                      ? "Leads Inativos"
                      : campaign.segment.type === "vip_clients"
                      ? "Clientes VIP"
                      : "Personalizado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.status === "running"
                        ? "bg-green-100 text-green-800"
                        : campaign.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : campaign.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : campaign.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.status === "running"
                      ? "Em Execução"
                      : campaign.status === "scheduled"
                      ? "Agendada"
                      : campaign.status === "completed"
                      ? "Concluída"
                      : campaign.status === "paused"
                      ? "Pausada"
                      : "Rascunho"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>Enviados: {campaign.analytics.sent}</div>
                    <div>Conversões: {campaign.analytics.converted}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleStatus(e, campaign)}
                      className={`p-1 rounded-full ${
                        campaign.status === "running"
                          ? "text-yellow-600 hover:text-yellow-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {campaign.status === "running" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, campaign)}
                      className="p-1 text-gray-400 hover:text-gray-900 rounded-full"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle analytics view
                      }}
                      className="p-1 text-gray-400 hover:text-gray-900 rounded-full"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
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
