import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  Tag,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import { AppointmentDetailsModal } from "./AppointmentDetailsModal";
import type { Event } from "@/types";

interface AppointmentsModalProps {
  onClose: () => void;
  data: {
    appointments: {
      value: number;
      change: string;
      trend: string;
    };
  };
}

export function AppointmentsModal({ onClose, data }: AppointmentsModalProps) {
  const [filterStatus, setFilterStatus] = useState<
    "all" | "confirmed" | "pending"
  >("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Event | null>(
    null
  );

  // Mock data - replace with real data from your state management
  const appointments: Event[] = [
    {
      id: "1",
      title: "Locação Vectus",
      start: new Date(2024, 2, 15, 9, 0),
      end: new Date(2024, 2, 15, 17, 0),
      client: "Clínica Beleza & Saúde",
      service: "Vectus - Depilação a Laser",
      status: "confirmed",
      location: "Rua das Flores, 123",
      notes: "Cliente regular, equipamento reservado",
    },
    {
      id: "2",
      title: "Locação Criolipólise",
      start: new Date(2024, 2, 15, 8, 30),
      end: new Date(2024, 2, 15, 18, 30),
      client: "Espaço Estética Avançada",
      service: "Cool Sculpting Pro",
      status: "confirmed",
      location: "Av. Principal, 456",
      notes: "Necessário treinamento inicial",
    },
    {
      id: "3",
      title: "Locação HIFU",
      start: new Date(2024, 2, 15, 10, 0),
      end: new Date(2024, 2, 15, 16, 0),
      client: "Centro de Estética Maria Silva",
      service: "HIFU Ultraformer",
      status: "confirmed",
      location: "Rua do Comércio, 789",
      notes: "Cliente novo, incluir manual de operação",
    },
    {
      id: "4",
      title: "Locação Radiofrequência",
      start: new Date(2024, 2, 15, 9, 30),
      end: new Date(2024, 2, 15, 17, 30),
      client: "Clínica Renovar",
      service: "Spectra RF",
      status: "confirmed",
      location: "Av. das Indústrias, 321",
      notes: "Manutenção realizada recentemente",
    },
    {
      id: "5",
      title: "Locação Endermologia",
      start: new Date(2024, 2, 15, 8, 0),
      end: new Date(2024, 2, 15, 16, 0),
      client: "Studio Beleza Natural",
      service: "LPG Endermologie",
      status: "pending",
      location: "Rua dos Jardins, 654",
      notes: "Aguardando confirmação de pagamento",
    },
    {
      id: "6",
      title: "Locação Laser CO2",
      start: new Date(2024, 2, 15, 10, 30),
      end: new Date(2024, 2, 15, 18, 30),
      client: "Clínica Dermatológica Saúde",
      service: "Laser CO2 Fracionado",
      status: "pending",
      location: "Av. Central, 987",
      notes: "Primeira locação, requer documentação",
    },
    {
      id: "7",
      title: "Locação Microagulhamento",
      start: new Date(2024, 2, 15, 9, 0),
      end: new Date(2024, 2, 15, 15, 0),
      client: "Espaço Bem Estar",
      service: "Dermapen Pro",
      status: "pending",
      location: "Rua das Palmeiras, 147",
      notes: "Aguardando comprovante de endereço",
    },
  ];

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus === "all") return true;
    return appointment.status === filterStatus;
  });

  const handleConfirmAppointment = () => {
    // Handle appointment confirmation
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = () => {
    // Handle appointment cancellation
    setSelectedAppointment(null);
  };

  const handleRescheduleAppointment = () => {
    // Handle appointment rescheduling
    setSelectedAppointment(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-semibold">Agendamentos de Hoje</h2>
            <p className="text-sm text-gray-500">
              {data.appointments.value} agendamentos • {data.appointments.trend}{" "}
              que ontem
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Fixed Filter Buttons */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                filterStatus === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({appointments.length})
            </button>
            <button
              onClick={() => setFilterStatus("confirmed")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                filterStatus === "confirmed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmados (4)
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pendentes (3)
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => setSelectedAppointment(appointment)}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-medium">{appointment.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status === "confirmed"
                        ? "Confirmado"
                        : "Pendente"}
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{appointment.client}</span>
                    </div>
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
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{appointment.location}</span>
                    </div>
                    {appointment.notes && (
                      <div className="text-sm text-gray-500 italic">
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {appointment.status === "pending" ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmAppointment();
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                        title="Confirmar"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment();
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Cancelar"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRescheduleAppointment();
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                      title="Reagendar"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Details Modal */}
        {selectedAppointment && (
          <AppointmentDetailsModal
            open={true}
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onConfirm={handleConfirmAppointment}
            onCancel={handleCancelAppointment}
            onReschedule={handleRescheduleAppointment}
          />
        )}
      </div>
    </div>
  );
}
