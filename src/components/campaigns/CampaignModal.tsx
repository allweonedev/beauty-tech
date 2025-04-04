import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Campaign } from "../../types/campaigns";

interface CampaignModalProps {
  campaign?: Campaign;
  onClose: () => void;
  onSave: (campaign: Partial<Campaign>) => void;
}

interface EmailEditorRef {
  exportHtml: (
    callback: (data: { design: Record<string, unknown>; html: string }) => void
  ) => void;
  loadDesign: (design: Record<string, unknown>) => void;
}

export function CampaignModal({
  campaign,
  onClose,
  onSave,
}: CampaignModalProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name ?? "",
    type: campaign?.type ?? "whatsapp",
    segment: {
      type: campaign?.segment.type ?? "active_clients",
      conditions: campaign?.segment.conditions ?? [],
    },
    content: {
      whatsapp: campaign?.content.whatsapp ?? {
        id: Math.random().toString(),
        name: "",
        content: "",
        variables: ["name"],
        buttons: [],
      },
      email: campaign?.content.email ?? {
        id: Math.random().toString(),
        name: "",
        subject: "",
        content: "",
        design: {} as Record<string, unknown>,
      },
    },
    schedule: {
      startDate: campaign?.schedule.startDate
        ? new Date(campaign?.schedule.startDate).toISOString().split("T")[0]
        : "",
      endDate: campaign?.schedule.endDate
        ? new Date(campaign?.schedule.endDate).toISOString().split("T")[0]
        : "",
      frequency: campaign?.schedule.frequency ?? "once",
      timeSlots: campaign?.schedule.timeSlots ?? [],
    },
    aiSettings: {
      enabled: campaign?.aiSettings?.enabled ?? false,
      personalization: campaign?.aiSettings?.personalization ?? false,
      optimization: campaign?.aiSettings?.optimization ?? false,
      responseHandling: campaign?.aiSettings?.responseHandling ?? false,
    },
  });

  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [emailEditorLoaded, setEmailEditorLoaded] = useState(false);
  const emailEditorRef = React.useRef<EmailEditorRef>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (emailEditorRef.current && formData.type !== "whatsapp") {
      emailEditorRef.current.exportHtml((data) => {
        const { design, html } = data;
        const emailContent = formData.content.email;
        emailContent.content = html;
        emailContent.design = design;

        saveFormData();
      });
    } else {
      saveFormData();
    }
  };

  const saveFormData = () => {
    onSave({
      ...campaign,
      ...formData,
      schedule: {
        ...formData.schedule,
        startDate: new Date(formData.schedule.startDate || new Date()),
        endDate: formData.schedule.endDate
          ? new Date(formData.schedule.endDate)
          : new Date(),
        frequency: formData.schedule
          .frequency as Campaign["schedule"]["frequency"],
      },
      status: campaign?.status ?? "draft",
      analytics: campaign?.analytics ?? {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        responded: 0,
        converted: 0,
      },
      createdAt: campaign?.createdAt ?? new Date(),
      updatedAt: new Date(),
    });
    onClose();
  };

  const handleAddTimeSlot = () => {
    if (newTimeSlot && !formData.schedule.timeSlots.includes(newTimeSlot)) {
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          timeSlots: [...formData.schedule.timeSlots, newTimeSlot].sort(),
        },
      });
      setNewTimeSlot("");
    }
  };

  const handleRemoveTimeSlot = (slot: string) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        timeSlots: formData.schedule.timeSlots.filter((s) => s !== slot),
      },
    });
  };

  const handleWhatsAppContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        whatsapp: {
          ...formData.content.whatsapp,
          content: e.target.value,
        },
      },
    });
  };

  const handleEmailEditorLoad = () => {
    setEmailEditorLoaded(true);
    if (formData.content.email?.design && emailEditorRef.current) {
      emailEditorRef.current.loadDesign(formData.content.email.design);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {campaign ? "Editar Campanha" : "Nova Campanha"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da Campanha
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Campaign["type"],
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="multi-channel">Multi-canal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Segmento
            </label>
            <select
              value={formData.segment.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  segment: {
                    ...formData.segment,
                    type: e.target.value as Campaign["segment"]["type"],
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="active_clients">Clientes Ativos</option>
              <option value="inactive_leads">Leads Inativos</option>
              <option value="vip_clients">Clientes VIP</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Conteúdo</h3>

            {(formData.type === "whatsapp" ||
              formData.type === "multi-channel") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Mensagem WhatsApp
                </label>
                <textarea
                  value={formData.content.whatsapp?.content}
                  onChange={handleWhatsAppContentChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Digite sua mensagem... Use {name} para personalização"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Variáveis disponíveis: {"{name}"}, {"{email}"}
                </p>
              </div>
            )}

            {(formData.type === "email" ||
              formData.type === "multi-channel") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="border border-gray-300 rounded-md">
                  {/* <EmailEditor
                    ref={emailEditorRef}
                    onLoad={handleEmailEditorLoad}
                    minHeight={400}
                  /> */}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Agendamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={formData.schedule.startDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        startDate: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={formData.schedule.endDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        endDate: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frequência
                </label>
                <select
                  value={formData.schedule.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schedule: {
                        ...formData.schedule,
                        frequency: (e.target.value || "once") as
                          | "once"
                          | "daily"
                          | "weekly"
                          | "monthly",
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="once">Uma vez</option>
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensalmente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Horários
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="time"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.schedule.timeSlots.map((slot) => (
                    <span
                      key={slot}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {slot}
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(slot)}
                        className="ml-1 text-indigo-600 hover:text-indigo-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configurações de IA
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ai-enabled"
                  checked={formData.aiSettings.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aiSettings: {
                        ...formData.aiSettings,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="ai-enabled"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Habilitar IA
                </label>
              </div>
              {formData.aiSettings.enabled && (
                <>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ai-personalization"
                      checked={formData.aiSettings.personalization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aiSettings: {
                            ...formData.aiSettings,
                            personalization: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="ai-personalization"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Personalização de conteúdo
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ai-optimization"
                      checked={formData.aiSettings.optimization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aiSettings: {
                            ...formData.aiSettings,
                            optimization: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="ai-optimization"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Otimização de horários
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ai-response"
                      checked={formData.aiSettings.responseHandling}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aiSettings: {
                            ...formData.aiSettings,
                            responseHandling: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="ai-response"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Tratamento automático de respostas
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  );
}
