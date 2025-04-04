import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { LineChart } from "@/components/ui/Charts";

interface SalesChartProps {
  data: {
    weekly: number[];
    monthly: number[];
    yearly: number[];
  };
  trend: string;
  value: number;
}

export function SalesChart({ data, trend, value }: SalesChartProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">(
    "weekly"
  );

  const labels = {
    weekly: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    monthly: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    yearly: ["2020", "2021", "2022", "2023", "2024"],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        min: 2000,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: (value: string | number) =>
            `R$ ${Number(value).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-600">Vendas</h3>
          <span className="text-xs font-medium text-green-600">{trend}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "weekly" | "monthly" | "yearly")
            }
            className="text-sm border-none focus:ring-0 text-gray-600 cursor-pointer"
          >
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>

      <div className="text-xl font-semibold mb-2 text-center">
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)}
      </div>

      <div className="h-[200px] flex-1">
        <LineChart
          data={{
            labels: labels[period],
            datasets: [
              {
                data: data[period],
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79, 70, 229, 0.1)",
                fill: true,
                tension: 0.4,
              },
            ],
          }}
          options={chartOptions}
        />
      </div>
    </div>
  );
}
