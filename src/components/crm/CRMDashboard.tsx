import React from "react";
import { BarChart, LineChart, PieChart } from "../ui/Charts";
import { DashboardCard } from "../dashboard/DashboardCard";
import { MessageSquare, TrendingUp, Clock, Users } from "lucide-react";
import type { LeadStats } from "../../types/crm";

export function CRMDashboard() {
  // Mock data - replace with real data from your state management
  const stats: LeadStats = {
    totalLeads: 145,
    stageDistribution: {
      new_contact: 45,
      interested: 35,
      negotiation: 30,
      payment: 20,
      closed: 15,
    },
    conversionRate: 28.5,
    averageResponseTime: 2.4,
    topSources: [
      { source: "website", count: 65 },
      { source: "social", count: 40 },
      { source: "referral", count: 25 },
      { source: "other", count: 15 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon={MessageSquare}
          title="Total de Leads"
          value={stats.totalLeads.toString()}
          description="+12% que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={TrendingUp}
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          description="+5% que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={Clock}
          title="Tempo de Resposta"
          value={`${stats.averageResponseTime}min`}
          description="-15min que mês anterior"
          trend="down"
        />
        <DashboardCard
          icon={Users}
          title="Leads Qualificados"
          value="68"
          description="+8 que mês anterior"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Distribuição por Estágio
          </h3>
          <div className="h-[300px]">
            <BarChart
              data={{
                labels: [
                  "Novo Contato",
                  "Interessado",
                  "Negociação",
                  "Pagamento",
                  "Fechado",
                ],
                datasets: [
                  {
                    label: "Leads",
                    data: [
                      stats.stageDistribution.new_contact,
                      stats.stageDistribution.interested,
                      stats.stageDistribution.negotiation,
                      stats.stageDistribution.payment,
                      stats.stageDistribution.closed,
                    ],
                    backgroundColor: "#4F46E5",
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Origem dos Leads</h3>
          <div className="h-[300px]">
            <PieChart
              data={{
                labels: stats.topSources.map((source) => source.source),
                datasets: [
                  {
                    data: stats.topSources.map((source) => source.count),
                    backgroundColor: [
                      "#4F46E5",
                      "#10B981",
                      "#F59E0B",
                      "#6B7280",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "right",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Tendência de Conversão</h3>
        <div className="h-[300px]">
          <LineChart
            data={{
              labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
              datasets: [
                {
                  label: "Taxa de Conversão",
                  data: [22, 25, 28, 26, 28.5, 30],
                  borderColor: "#10B981",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                  ticks: {
                    callback: (value) => `${value}%`,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
