import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MessageSquare,
  Calendar,
  Send,
  Clock,
  Star,
} from "lucide-react";
import type { Lead } from "../../types/crm";

interface LeadsListProps {
  onNewLead: () => void;
  onEditLead: (lead: Lead) => void;
}

export function LeadsList({ onNewLead, onEditLead }: LeadsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<"all" | Lead["stage"]>("all");
  const [filterProfile, setFilterProfile] = useState<
    "all" | Lead["profile"]["type"]
  >("all");

  // Mock data - replace with real data from your state management
  const leads: Lead[] = [
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(41) 99999-9999",
      source: "website",
      stage: "new_contact",
      profile: {
        type: "hot",
        potentialValue: 1500,
        interests: ["aesthetic", "facial"],
        responseTime: 2,
      },
      interactions: [],
      automations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["new", "website"],
      notes: "",
    },
  ];

  const handleQuickAction = async (
    e: React.MouseEvent,
    lead: Lead,
    action: string
  ) => {
    e.stopPropagation();
    switch (action) {
      case "message":
        // Handle sending message
        break;
      case "schedule":
        // Handle scheduling
        break;
      case "automate":
        // Handle automation
        break;
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);

    const matchesStage = filterStage === "all" || lead.stage === filterStage;
    const matchesProfile =
      filterProfile === "all" || lead.profile.type === filterProfile;

    return matchesSearch && matchesStage && matchesProfile;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Leads</h3>
        <button
          onClick={onNewLead}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Novo Lead
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStage}
            onChange={(e) =>
              setFilterStage(e.target.value as "all" | Lead["stage"])
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Estágios</option>
            <option value="new_contact">Novo Contato</option>
            <option value="interested">Interessado</option>
            <option value="negotiation">Negociação</option>
            <option value="payment">Pagamento</option>
            <option value="closed">Fechado</option>
          </select>
          <select
            value={filterProfile}
            onChange={(e) =>
              setFilterProfile(
                e.target.value as "all" | Lead["profile"]["type"]
              )
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Perfis</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estágio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Potencial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Próximo Follow-up
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onEditLead(lead)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lead.profile.type === "hot"
                        ? "bg-red-100 text-red-800"
                        : lead.profile.type === "warm"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {lead.profile.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lead.stage === "new_contact"
                        ? "bg-gray-100 text-gray-800"
                        : lead.stage === "interested"
                        ? "bg-blue-100 text-blue-800"
                        : lead.stage === "negotiation"
                        ? "bg-yellow-100 text-yellow-800"
                        : lead.stage === "payment"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {lead.stage === "new_contact"
                      ? "Novo Contato"
                      : lead.stage === "interested"
                      ? "Interessado"
                      : lead.stage === "negotiation"
                      ? "Negociação"
                      : lead.stage === "payment"
                      ? "Pagamento"
                      : "Fechado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(lead.profile.potentialValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.lastContactDate
                    ? new Date(lead.lastContactDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.nextFollowUp
                    ? new Date(lead.nextFollowUp).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleQuickAction(e, lead, "message")}
                      className="text-gray-400 hover:text-gray-900"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleQuickAction(e, lead, "schedule")}
                      className="text-gray-400 hover:text-gray-900"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleQuickAction(e, lead, "automate")}
                      className="text-gray-400 hover:text-gray-900"
                    >
                      <Send className="w-4 h-4" />
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
