import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  Star,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NotificationDetailsModalProps {
  notification: {
    id: string;
    title: string;
    description: string;
    time: string;
    type: "client" | "payment" | "appointment" | "review";
    data?: {
      clientId?: string;
      paymentId?: string;
      appointmentId?: string;
      reviewId?: string;
      amount?: number;
      clientName?: string;
      appointmentTime?: string;
      rating?: number;
    };
  };
  onClose: () => void;
  open: boolean;
}

export function NotificationDetailsModal({
  notification,
  onClose,
  open,
}: NotificationDetailsModalProps) {
  const handleViewReceipt = () => {
    // In a real app, this would open the receipt modal with the specific receipt data
    alert("Opening receipt...");
  };

  const handleViewHistory = () => {
    // In a real app, this would show the history for the specific item
    alert("Opening history...");
  };

  const handleScheduleAppointment = () => {
    // In a real app, this would open the appointment scheduling modal
    alert("Opening appointment scheduler...");
  };

  const handleAddClient = () => {
    // In a real app, this would open the new client modal
    alert("Opening new client form...");
  };

  const handleViewReview = () => {
    // In a real app, this would show the review details
    alert("Opening review details...");
  };

  const renderContent = () => {
    switch (notification.type) {
      case "appointment":
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                <Calendar className="w-5 h-5" />
                <span>Detalhes do Agendamento</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">
                    {notification.data?.clientName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">
                    {new Date(
                      notification.data?.appointmentTime ?? ""
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">Local do Agendamento</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleViewHistory}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Ver Histórico
              </button>
              <button
                onClick={handleScheduleAppointment}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Agendar
              </button>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <DollarSign className="w-5 h-5" />
                <span>Detalhes do Pagamento</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="text-gray-900 font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(notification.data?.amount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Confirmado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="text-gray-900">{notification.time}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleViewHistory}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Ver Histórico
              </button>
              <button
                onClick={handleViewReceipt}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Ver Recibo
              </button>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                <Star className="w-5 h-5" />
                <span>Nova Avaliação</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: notification.data?.rating ?? 5 }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                </div>
                <div className="text-gray-700">
                  &quot;Excelente atendimento! Muito satisfeito com o
                  serviço.&quot;
                </div>
                <div className="text-sm text-gray-500">
                  Avaliado em: {notification.time}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleViewHistory}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Ver Histórico
              </button>
              <button
                onClick={handleViewReview}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Ver Avaliação
              </button>
            </div>
          </div>
        );

      case "client":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                <User className="w-5 h-5" />
                <span>Novo Cliente</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    {notification.data?.clientName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    Aguardando primeiro contato
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    Cadastrado {notification.time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleViewHistory}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Ver Histórico
              </button>
              <button
                onClick={handleAddClient}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Adicionar Cliente
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
