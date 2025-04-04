import React, { useState } from "react";
import {
  Plus,
  Clock,
  MessageSquare,
  Calendar,
  Send,
  Settings,
  X,
} from "lucide-react";
import type { AutomationTask } from "../../types/crm";

export function AutomationRules() {
  const [showNewRule, setShowNewRule] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("schedule_link");

  // Mock data - replace with real data from your state management
  const automations: AutomationTask[] = [
    {
      id: "1",
      type: "schedule_link",
      status: "pending",
      scheduledFor: new Date(),
      template: "Agendamento Inicial",
      data: {
        message: "Olá {name}, clique aqui para agendar sua consulta: {link}",
      },
    },
  ];

  const templates = {
    schedule_link: {
      name: "Link de Agendamento",
      description: "Envia link para agendamento automático",
      icon: Calendar,
    },
    payment_link: {
      name: "Link de Pagamento",
      description: "Envia link para pagamento",
      icon: Send,
    },
    reengagement: {
      name: "Re-engajamento",
      description: "Reengaja leads inativos",
      icon: MessageSquare,
    },
    reminder: {
      name: "Lembrete",
      description: "Envia lembretes automáticos",
      icon: Clock,
    },
    promotion: {
      name: "Promoção",
      description: "Envia ofertas especiais",
      icon: Settings,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Automações</h3>
        <button
          onClick={() => setShowNewRule(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Nova Automação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(templates).map(([key, template]) => {
          const Icon = template.icon;
          const activeAutomations = automations.filter((a) => a.type === key);

          return (
            <div
              key={key}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {template.description}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                  {activeAutomations.length} ativa
                  {activeAutomations.length !== 1 && "s"}
                </span>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedTemplate(key);
                    setShowNewRule(true);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors duration-200"
                >
                  Configurar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showNewRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Nova Automação</h2>
              <button
                onClick={() => setShowNewRule(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {Object.entries(templates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Condições
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                      <option>Estágio</option>
                      <option>Perfil</option>
                      <option>Origem</option>
                      <option>Valor Potencial</option>
                    </select>
                    <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                      <option>é igual a</option>
                      <option>contém</option>
                      <option>maior que</option>
                      <option>menor que</option>
                    </select>
                    <input
                      type="text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Valor"
                    />
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  + Adicionar condição
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ações
                </label>
                <div className="mt-2 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600">
                      Mensagem
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Digite a mensagem..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Variáveis disponíveis: {"{name}"}, {"{email}"}, {"{link}"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">
                      Agendar para
                    </label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                      <option>Imediatamente</option>
                      <option>1 hora depois</option>
                      <option>24 horas depois</option>
                      <option>3 dias depois</option>
                      <option>1 semana depois</option>
                      <option>Personalizado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRule(false)}
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
