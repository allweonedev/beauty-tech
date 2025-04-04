import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Lead, Interaction } from "../../types/crm";

interface LeadModalProps {
  lead?: Lead;
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
}

export function LeadModal({ lead, onClose, onSave }: LeadModalProps) {
  const [formData, setFormData] = useState({
    name: lead?.name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    source: lead?.source ?? "website",
    stage: lead?.stage ?? "new_contact",
    profile: {
      type: lead?.profile.type ?? "warm",
      potentialValue: lead?.profile.potentialValue ?? 0,
      interests: lead?.profile.interests ?? [],
      responseTime: lead?.profile.responseTime ?? 24,
    },
    notes: lead?.notes ?? "",
    tags: lead?.tags ?? [],
  });

  const [newInteraction, setNewInteraction] = useState({
    type: "email" as Interaction["type"],
    direction: "outbound" as Interaction["direction"],
    subject: "",
    content: "",
    outcome: "",
    nextSteps: "",
  });

  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...lead,
      ...formData,
      updatedAt: new Date(),
    });
    onClose();
  };

  const handleAddInteraction = () => {
    if (newInteraction.subject && newInteraction.content) {
      // In a real app, update interactions in your state management
      setNewInteraction({
        type: "email",
        direction: "outbound",
        subject: "",
        content: "",
        outcome: "",
        nextSteps: "",
      });
    }
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {lead ? "Editar Lead" : "Novo Lead"}
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
                Nome
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
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Origem
              </label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="website">Website</option>
                <option value="social">Redes Sociais</option>
                <option value="referral">Indicação</option>
                <option value="other">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estágio
              </label>
              <select
                value={formData.stage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stage: e.target.value as Lead["stage"],
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="new_contact">Novo Contato</option>
                <option value="interested">Interessado</option>
                <option value="negotiation">Negociação</option>
                <option value="payment">Pagamento</option>
                <option value="closed">Fechado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Perfil
              </label>
              <select
                value={formData.profile.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: {
                      ...formData.profile,
                      type: e.target.value as Lead["profile"]["type"],
                    },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valor Potencial
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  value={formData.profile.potentialValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        potentialValue: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interesses
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["aesthetic", "facial", "body", "hair", "massage", "other"].map(
                (interest) => (
                  <label key={interest} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.profile.interests.includes(interest)}
                      onChange={(e) => {
                        const interests = e.target.checked
                          ? [...formData.profile.interests, interest]
                          : formData.profile.interests.filter(
                              (i) => i !== interest
                            );
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, interests },
                        });
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-indigo-600 hover:text-indigo-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nova tag..."
                  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {lead && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nova Interação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <select
                    value={newInteraction.type}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        type: e.target.value as Interaction["type"],
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="email">Email</option>
                    <option value="call">Ligação</option>
                    <option value="meeting">Reunião</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="form">Formulário</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Direção
                  </label>
                  <select
                    value={newInteraction.direction}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        direction: e.target.value as Interaction["direction"],
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="inbound">Recebido</option>
                    <option value="outbound">Enviado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={newInteraction.subject}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        subject: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Conteúdo
                  </label>
                  <textarea
                    value={newInteraction.content}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        content: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resultado
                  </label>
                  <input
                    type="text"
                    value={newInteraction.outcome}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        outcome: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Próximos Passos
                  </label>
                  <input
                    type="text"
                    value={newInteraction.nextSteps}
                    onChange={(e) =>
                      setNewInteraction({
                        ...newInteraction,
                        nextSteps: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddInteraction}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Interação
                </button>
              </div>
            </div>
          )}

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
