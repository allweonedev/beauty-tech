import React, { useState } from "react";
import {
  X,
  Globe,
  Webhook,
  Users,
  Building,
  Link as LinkIcon,
  Brain,
  Database,
  Network,
  Save,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("language");
  const [isDirty, setIsDirty] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR");
  const [, setCurrentLanguage] = useState("pt-BR");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // MCP State
  const [mcpSettings, setMcpSettings] = useState({
    baseModel: "gpt-4",
    temperature: 0.7,
    contextWindow: "16k",
    smartMemory: true,
    contextPreservation: true,
    semanticSearch: true,
    dynamicPrompting: false,
  });

  const tabs = [
    {
      id: "language",
      label: selectedLanguage === "en" ? "Language" : "Idioma",
      icon: Globe,
    },
    { id: "mcp", label: "MCP", icon: Brain },
    { id: "api", label: "API Partners", icon: Webhook },
    {
      id: "staff",
      label: selectedLanguage === "en" ? "Staff" : "Equipe",
      icon: Users,
    },
    {
      id: "bank",
      label: selectedLanguage === "en" ? "Bank" : "Banco",
      icon: Building,
    },
    {
      id: "integrations",
      label: selectedLanguage === "en" ? "Integrations" : "Integrações",
      icon: LinkIcon,
    },
  ];

  const handleMCPChange = (key: string, value: string | number | boolean) => {
    setMcpSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSaveChanges = () => {
    setIsDirty(false);
  };

  const handleResetDefaults = () => {
    setMcpSettings({
      baseModel: "gpt-4",
      temperature: 0.7,
      contextWindow: "16k",
      smartMemory: true,
      contextPreservation: true,
      semanticSearch: true,
      dynamicPrompting: false,
    });
    setIsDirty(true);
  };

  const handleTabChange = (tabId: string) => {
    if (isDirty) {
      const confirm = window.confirm(
        selectedLanguage === "en"
          ? "You have unsaved changes. Are you sure you want to leave this tab?"
          : "Você tem alterações não salvas. Tem certeza que deseja sair desta aba?"
      );
      if (!confirm) return;
    }
    setActiveTab(tabId);
    setIsDirty(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
    setIsDirty(true);
  };

  const handleSaveLanguage = () => {
    setCurrentLanguage(selectedLanguage);
    setShowSaveSuccess(true);
    setIsDirty(false);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-semibold">
            {selectedLanguage === "en" ? "Settings" : "Configurações"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          <div className="w-64 border-r bg-gray-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      activeTab === tab.id ? "scale-110" : ""
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "language" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">
                  {selectedLanguage === "en"
                    ? "Language Settings"
                    : "Configurações de Idioma"}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-48"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English</option>
                    </select>
                    <button
                      onClick={handleSaveLanguage}
                      disabled={!isDirty}
                      className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2 ${
                        isDirty
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {selectedLanguage === "en" ? "Save" : "Salvar"}
                    </button>
                  </div>
                  {showSaveSuccess && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-md animate-fade-in">
                      <CheckCircle className="w-5 h-5" />
                      <span>
                        {selectedLanguage === "en"
                          ? "Language updated successfully!"
                          : "Idioma atualizado com sucesso!"}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    {selectedLanguage === "en"
                      ? "Choose your preferred language"
                      : "Escolha seu idioma preferido"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "mcp" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Model Context Protocol (MCP)
                  </h3>
                  {isDirty && (
                    <span className="text-sm text-yellow-600 animate-pulse">
                      ● Unsaved changes
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Model Configuration
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Model
                          </label>
                          <select
                            value={mcpSettings.baseModel}
                            onChange={(e) =>
                              handleMCPChange("baseModel", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5">GPT-3.5</option>
                            <option value="claude">Claude</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temperature ({mcpSettings.temperature})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={mcpSettings.temperature}
                            onChange={(e) =>
                              handleMCPChange(
                                "temperature",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full accent-indigo-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Focused</span>
                            <span>Balanced</span>
                            <span>Creative</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Context Management
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Context Window
                          </label>
                          <select
                            value={mcpSettings.contextWindow}
                            onChange={(e) =>
                              handleMCPChange("contextWindow", e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="4k">4K tokens</option>
                            <option value="8k">8K tokens</option>
                            <option value="16k">16K tokens</option>
                            <option value="32k">32K tokens</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="memory-management"
                            checked={mcpSettings.smartMemory}
                            onChange={(e) =>
                              handleMCPChange("smartMemory", e.target.checked)
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <label
                            htmlFor="memory-management"
                            className="text-sm text-gray-700"
                          >
                            Enable smart memory management
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Protocol Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="context-preservation"
                            checked={mcpSettings.contextPreservation}
                            onChange={(e) =>
                              handleMCPChange(
                                "contextPreservation",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <label
                            htmlFor="context-preservation"
                            className="text-sm text-gray-700"
                          >
                            Context preservation
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="semantic-search"
                            checked={mcpSettings.semanticSearch}
                            onChange={(e) =>
                              handleMCPChange(
                                "semanticSearch",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <label
                            htmlFor="semantic-search"
                            className="text-sm text-gray-700"
                          >
                            Semantic search
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="dynamic-prompting"
                            checked={mcpSettings.dynamicPrompting}
                            onChange={(e) =>
                              handleMCPChange(
                                "dynamicPrompting",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <label
                            htmlFor="dynamic-prompting"
                            className="text-sm text-gray-700"
                          >
                            Dynamic prompting
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Data Integration
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Database className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            Vector Database
                          </span>
                          <div className="ml-auto flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-sm text-green-600">
                              Connected
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Network className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            Knowledge Graph
                          </span>
                          <div className="ml-auto flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                            <span className="text-sm text-yellow-600">
                              Syncing
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">
                      System Status
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">
                          Active Models
                        </p>
                        <p className="font-medium text-xl">3/5</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">
                          Token Usage
                        </p>
                        <p className="font-medium text-xl">45.2K</p>
                        <p className="text-xs text-gray-400">of 100K</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">
                          Response Time
                        </p>
                        <p className="font-medium text-xl">234ms</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">
                          Success Rate
                        </p>
                        <p className="font-medium text-xl text-green-600">
                          99.8%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    disabled={!isDirty}
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">API Partners</h3>
                <div className="space-y-4">
                  {["Partner 1", "Partner 2", "Partner 3"].map(
                    (partner, index) => (
                      <div
                        key={index}
                        className="p-6 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow duration-200"
                      >
                        <h4 className="font-medium mb-4">{partner}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              API Key
                            </label>
                            <input
                              type="text"
                              placeholder="Enter API Key"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              API Secret
                            </label>
                            <input
                              type="password"
                              placeholder="Enter API Secret"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm">
                          <Webhook className="w-4 h-4" />
                          Connect
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Staff Management / Gestão de Equipe
                  </h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Add New Staff / Adicionar Funcionário
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name / Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role / Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions / Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {["Ana Silva", "João Santos", "Maria Oliveira"].map(
                        (name, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              Admin
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active / Ativo
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                                Edit / Editar
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Bank Connections / Conexões Bancárias
                  </h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Add Bank / Adicionar Banco
                  </button>
                </div>
                <div className="grid gap-4">
                  {["Banco do Brasil", "Itaú", "Bradesco"].map(
                    (bank, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{bank}</h4>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Connected / Conectado
                          </span>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          Last sync: 5 minutes ago / Última sincronização: 5
                          minutos atrás
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors">
                            Sync / Sincronizar
                          </button>
                          <button className="px-3 py-1.5 text-sm text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded transition-colors">
                            Disconnect / Desconectar
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">
                  Integrations / Integrações
                </h3>
                <div className="space-y-4">
                  {[
                    "WhatsApp Business API",
                    "Payment Gateway / Gateway de Pagamento",
                    "Email Marketing",
                  ].map((integration, index) => (
                    <div
                      key={index}
                      className="p-6 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{integration}</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Configure integration settings / Configurar definições
                        da integração
                      </p>
                      <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition-colors">
                        Configure / Configurar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
