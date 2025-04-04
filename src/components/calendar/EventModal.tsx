import React, { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/types";

interface EventModalProps {
  event?: Event;
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
}

export function EventModal({ event, onClose, onSave }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: event?.title ?? "",
    client: event?.client ?? "",
    service: event?.service ?? "",
    status: event?.status ?? "pending",
    start: event?.start ? format(event.start, "yyyy-MM-dd'T'HH:mm") : "",
    end: event?.end ? format(event.end, "yyyy-MM-dd'T'HH:mm") : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "O título é obrigatório";
    }
    if (!formData.client.trim()) {
      newErrors.client = "O cliente é obrigatório";
    }
    if (!formData.service.trim()) {
      newErrors.service = "O serviço é obrigatório";
    }
    if (!formData.start) {
      newErrors.start = "A data/hora inicial é obrigatória";
    }
    if (!formData.end) {
      newErrors.end = "A data/hora final é obrigatória";
    }
    if (
      formData.start &&
      formData.end &&
      new Date(formData.start) >= new Date(formData.end)
    ) {
      newErrors.end = "A data/hora final deve ser posterior à inicial";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      start: new Date(formData.start),
      end: new Date(formData.end),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="event-modal-title"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 id="event-modal-title" className="text-xl font-semibold">
            {event ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.title ? "border-red-300" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-indigo-500`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) =>
                setFormData({ ...formData, client: e.target.value })
              }
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.client ? "border-red-300" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-indigo-500`}
              aria-invalid={!!errors.client}
              aria-describedby={errors.client ? "client-error" : undefined}
            />
            {errors.client && (
              <p id="client-error" className="mt-1 text-sm text-red-600">
                {errors.client}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Serviço
            </label>
            <input
              type="text"
              value={formData.service}
              onChange={(e) =>
                setFormData({ ...formData, service: e.target.value })
              }
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.service ? "border-red-300" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-indigo-500`}
              aria-invalid={!!errors.service}
              aria-describedby={errors.service ? "service-error" : undefined}
            />
            {errors.service && (
              <p id="service-error" className="mt-1 text-sm text-red-600">
                {errors.service}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Início
            </label>
            <input
              type="datetime-local"
              value={formData.start}
              onChange={(e) =>
                setFormData({ ...formData, start: e.target.value })
              }
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.start ? "border-red-300" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-indigo-500`}
              aria-invalid={!!errors.start}
              aria-describedby={errors.start ? "start-error" : undefined}
            />
            {errors.start && (
              <p id="start-error" className="mt-1 text-sm text-red-600">
                {errors.start}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fim
            </label>
            <input
              type="datetime-local"
              value={formData.end}
              onChange={(e) =>
                setFormData({ ...formData, end: e.target.value })
              }
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.end ? "border-red-300" : "border-gray-300"
              } focus:border-indigo-500 focus:ring-indigo-500`}
              aria-invalid={!!errors.end}
              aria-describedby={errors.end ? "end-error" : undefined}
            />
            {errors.end && (
              <p id="end-error" className="mt-1 text-sm text-red-600">
                {errors.end}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Event["status"],
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
              <option value="completed">Finalizado</option>
            </select>
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
