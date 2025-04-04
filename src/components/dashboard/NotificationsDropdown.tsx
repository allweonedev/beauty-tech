import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  ChevronRight,
  Clock,
  Filter,
  Search,
  UserPlus,
  DollarSign,
  Calendar,
  Star,
} from "lucide-react";
import { NotificationDetailsModal } from "./NotificationDetailsModal";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
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
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "client":
      return <UserPlus className="w-5 h-5 text-blue-600" />;
    case "payment":
      return <DollarSign className="w-5 h-5 text-green-600" />;
    case "appointment":
      return <Calendar className="w-5 h-5 text-purple-600" />;
    case "review":
      return <Star className="w-5 h-5 text-yellow-600" />;
  }
};

interface NotificationsModalProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

function NotificationsModal({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onNotificationClick,
}: NotificationsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | Notification["type"]>(
    "all"
  );

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "all" || notification.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold">Notificações</h2>
            <p className="text-sm text-gray-500">Todas as notificações</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "all" | Notification["type"])
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">Todos os Tipos</option>
                <option value="client">Clientes</option>
                <option value="payment">Pagamentos</option>
                <option value="appointment">Agendamentos</option>
                <option value="review">Avaliações</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className={`p-4 rounded-lg transition-colors cursor-pointer ${
                  notification.read ? "bg-white" : "bg-indigo-50"
                } hover:bg-gray-50`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(notification.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        {notification.time}
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          Marcar como lida
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma notificação encontrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Novo Agendamento",
      description: "Maria Silva agendou um horário para amanhã às 14h",
      time: "5 min atrás",
      read: false,
      type: "appointment",
      data: {
        appointmentId: "123",
        clientName: "Maria Silva",
        appointmentTime: "2024-03-15T14:00:00",
      },
    },
    {
      id: "2",
      title: "Pagamento Recebido",
      description: "Pagamento de R$ 150,00 confirmado",
      time: "10 min atrás",
      read: false,
      type: "payment",
      data: {
        paymentId: "456",
        amount: 150.0,
      },
    },
    {
      id: "3",
      title: "Nova Avaliação",
      description: "Cliente deixou uma avaliação 5 estrelas",
      time: "1 hora atrás",
      read: false,
      type: "review",
      data: {
        reviewId: "789",
        rating: 5,
      },
    },
    {
      id: "4",
      title: "Novo Cliente",
      description: "João Santos completou seu cadastro",
      time: "2 horas atrás",
      read: false,
      type: "client",
      data: {
        clientId: "012",
        clientName: "João Santos",
      },
    },
  ]);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Show notification details
    setSelectedNotification(notification);

    // Close the dropdown but keep the details modal open
    setIsOpen(false);
    setShowAllNotifications(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-gray-500 hover:text-gray-700"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Notificações
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? "bg-indigo-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {notification.time}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              Marcar como lida
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowAllNotifications(true);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 w-full text-center"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}

      {showAllNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowAllNotifications(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onRemove={removeNotification}
          onNotificationClick={handleNotificationClick}
        />
      )}

      {selectedNotification && (
        <NotificationDetailsModal
          open={true}
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
