import React from "react";
import { BarChart, LineChart, PieChart } from "../ui/Charts";
import { DashboardCard } from "../dashboard/DashboardCard";
import { MessageSquare, TrendingUp, Clock, Users } from "lucide-react";
import type { WhatsAppStats } from "../../types/whatsapp";

export function WhatsAppDashboard() {
  // Mock data - replace with real data from your state management
  const stats: WhatsAppStats = {
    totalContacts: 145,
    activeChats: 12,
    averageResponseTime: 2.4,
    messagesSent: 450,
    messagesReceived: 380,
    conversionRate: 28.5,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon={Users}
          title="Total de Contatos"
          value={stats.totalContacts.toString()}
          description="+12% que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={MessageSquare}
          title="Chats Ativos"
          value={stats.activeChats.toString()}
          description="+5% que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={Clock}
          title="Tempo de Resposta"
          value={`${stats.averageResponseTime}min`}
          description="-30s que mês anterior"
          trend="down"
        />
        <DashboardCard
          icon={TrendingUp}
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          description="+8% que mês anterior"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Volume de Mensagens</h3>
          <BarChart
            data={{
              labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
              datasets: [
                {
                  label: "Enviadas",
                  data: [320, 380, 450, 420, 480, 500],
                  backgroundColor: "#4F46E5",
                },
                {
                  label: "Recebidas",
                  data: [280, 320, 380, 360, 400, 420],
                  backgroundColor: "#10B981",
                },
              ],
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Distribuição por Estágio
          </h3>
          <PieChart
            data={{
              labels: [
                "Novo",
                "Engajado",
                "Qualificado",
                "Convertido",
                "Perdido",
              ],
              datasets: [
                {
                  data: [30, 25, 20, 15, 10],
                  backgroundColor: [
                    "#4F46E5",
                    "#10B981",
                    "#F59E0B",
                    "#6366F1",
                    "#EF4444",
                  ],
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Tendência de Conversão</h3>
        <LineChart
          data={{
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
            datasets: [
              {
                label: "Taxa de Conversão",
                data: [22, 25, 28, 26, 28.5, 30],
                borderColor: "#10B981",
                tension: 0.3,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
