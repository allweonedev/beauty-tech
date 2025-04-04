import React, { useState } from "react";
import { Search, Plus, Filter, Check, X } from "lucide-react";
import type { WhatsAppTemplate } from "../../types/whatsapp";

export function WhatsAppTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | WhatsAppTemplate["category"]
  >("all");
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  // Mock data - replace with real data from your state management
  const templates: WhatsAppTemplate[] = [
    {
      id: "1",
      name: "Boas-vindas",
      content:
        "Olá {name}! Seja bem-vindo(a) à Beauty Tech. Como posso ajudar você hoje?",
      variables: ["name"],
      category: "welcome",
      language: "pt-BR",
      status: "approved",
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || template.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Templates de Mensagem</h3>
        <button
          onClick={() => setShowNewTemplate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Novo Template
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(
                e.target.value as "all" | WhatsAppTemplate["category"]
              )
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="welcome">Boas-vindas</option>
            <option value="follow_up">Follow-up</option>
            <option value="scheduling">Agendamento</option>
            <option value="payment">Pagamento</option>
            <option value="reengagement">Reengajamento</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h4>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : template.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {template.status === "approved"
                    ? "Aprovado"
                    : template.status === "pending"
                    ? "Pendente"
                    : "Rejeitado"}
                </span>
              </div>
              <span className="text-sm text-gray-500">{template.language}</span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{template.content}</p>

            {template.variables.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Variáveis:
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <span
                      key={variable}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  template.category === "welcome"
                    ? "bg-blue-100 text-blue-800"
                    : template.category === "follow_up"
                    ? "bg-purple-100 text-purple-800"
                    : template.category === "scheduling"
                    ? "bg-green-100 text-green-800"
                    : template.category === "payment"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {template.category}
              </span>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Check className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
