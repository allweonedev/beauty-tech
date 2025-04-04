import React from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Tag,
  CheckCircle,
  XCircle,
  Package,
  Phone,
  Mail,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Event } from "@/types";

interface AppointmentDetailsModalProps {
  appointment: Event;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  open: boolean;
}

export function AppointmentDetailsModal({
  appointment,
  onClose,
  onConfirm,
  onCancel,
  onReschedule,
  open,
}: AppointmentDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-indigo-600" />
            <div>
              <DialogTitle>{appointment.title}</DialogTitle>
              <DialogDescription>Detalhes da Reserva</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2 ${
                appointment.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {appointment.status === "confirmed" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmado
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Pendente
                </>
              )}
            </span>
          </div>

          {/* Client Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Informações do Cliente
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm">{appointment.client}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">(41) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">cliente@email.com</span>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Detalhes do Serviço
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="w-4 h-4" />
                <span className="text-sm">{appointment.service}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {appointment.start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -
                  {appointment.end.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {appointment.start.toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{appointment.location}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Observações
              </h3>
              <div className="flex items-start gap-2 text-gray-600">
                <FileText className="w-4 h-4 mt-0.5" />
                <span className="text-sm">{appointment.notes}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          {appointment.status === "pending" ? (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                Cancelar Reserva
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Confirmar Reserva
              </button>
            </>
          ) : (
            <button
              onClick={onReschedule}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Reagendar
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
