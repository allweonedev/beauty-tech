import React from "react";
import { BarChart, LineChart, PieChart } from "@/components/ui/Charts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function FinancialDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon={Wallet}
          title="Saldo Atual"
          value="R$ 45.890,00"
          description="Atualizado agora"
          trend="up"
        />
        <DashboardCard
          icon={TrendingUp}
          title="Receitas (Mês)"
          value="R$ 28.450,00"
          description="+15% que mês anterior"
          trend="up"
        />
        <DashboardCard
          icon={TrendingDown}
          title="Despesas (Mês)"
          value="R$ 12.380,00"
          description="-8% que mês anterior"
          trend="down"
        />
        <DashboardCard
          icon={DollarSign}
          title="Lucro Real"
          value="R$ 16.070,00"
          description="+22% que mês anterior"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Receitas x Despesas</h3>
          <div className="h-[300px]">
            <BarChart
              data={{
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                datasets: [
                  {
                    label: "Receitas",
                    data: [25000, 28000, 24000, 26000, 28450, 30000],
                    backgroundColor: "#4F46E5",
                    borderRadius: 4,
                  },
                  {
                    label: "Despesas",
                    data: [12000, 13000, 11000, 12500, 12380, 13000],
                    backgroundColor: "#EF4444",
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) =>
                        `R$ ${Number(value).toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Lucro Real</h3>
          <div className="h-[300px]">
            <LineChart
              data={{
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                datasets: [
                  {
                    label: "Lucro",
                    data: [13000, 15000, 13000, 13500, 16070, 17000],
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
                    display: true,
                    position: "top",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) =>
                        `R$ ${Number(value).toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Receitas por Categoria</h3>
          <div className="h-[300px]">
            <PieChart
              data={{
                labels: ["Serviços", "Equipamentos", "Produtos", "Outros"],
                datasets: [
                  {
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                      "rgba(79, 70, 229, 0.8)",
                      "rgba(16, 185, 129, 0.8)",
                      "rgba(245, 158, 11, 0.8)",
                      "rgba(107, 114, 128, 0.8)",
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
          <div className="h-[300px]">
            <PieChart
              data={{
                labels: ["Fixas", "Variáveis", "Investimentos", "Outros"],
                datasets: [
                  {
                    data: [40, 35, 15, 10],
                    backgroundColor: [
                      "rgba(239, 68, 68, 0.8)",
                      "rgba(245, 158, 11, 0.8)",
                      "rgba(16, 185, 129, 0.8)",
                      "rgba(107, 114, 128, 0.8)",
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
    </div>
  );
}
