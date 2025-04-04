import React from "react";
import { BarChart, LineChart, PieChart } from "../ui/Charts";
import { DashboardCard } from "../dashboard/DashboardCard";
import { Megaphone, TrendingUp, Users, MessageSquare } from "lucide-react";
import type { CampaignStats } from "../../types/campaigns";

export function CampaignsDashboard() {
  // Mock data - replace with real data from your state management
  const stats: CampaignStats = {
    totalCampaigns: 24,
    activeCampaigns: 8,
    totalSent: 12500,
    averageOpenRate: 35.8,
    averageClickRate: 12.4,
    conversionRate: 8.5,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon={Megaphone}
          title="Campanhas Ativas"
          value={stats.activeCampaigns.toString()}
          description="+2 que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={Users}
          title="Total Enviados"
          value={stats.totalSent.toString()}
          description="+15% que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={MessageSquare}
          title="Taxa de Abertura"
          value={`${stats.averageOpenRate}%`}
          description="+5% que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={TrendingUp}
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          description="+2.5% que mês anterior"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Desempenho por Canal</h3>
          <BarChart
            data={{
              labels: ["WhatsApp", "Email", "Multi-canal"],
              datasets: [
                {
                  label: "Taxa de Abertura",
                  data: [45, 35, 40],
                  backgroundColor: "#4F46E5",
                },
                {
                  label: "Taxa de Clique",
                  data: [15, 12, 18],
                  backgroundColor: "#10B981",
                },
              ],
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Distribuição por Segmento
          </h3>
          <PieChart
            data={{
              labels: [
                "Clientes Ativos",
                "Leads Inativos",
                "Clientes VIP",
                "Personalizado",
              ],
              datasets: [
                {
                  data: [40, 30, 20, 10],
                  backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#6B7280"],
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Tendência de Engajamento</h3>
        <LineChart
          data={{
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
            datasets: [
              {
                label: "Taxa de Abertura",
                data: [30, 32, 35, 38, 35.8, 40],
                borderColor: "#4F46E5",
                tension: 0.3,
              },
              {
                label: "Taxa de Conversão",
                data: [5, 6, 7.5, 8, 8.5, 9],
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
