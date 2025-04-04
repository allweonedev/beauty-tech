"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar as CalendarIcon,
  Users,
  Package,
  FileText,
  Contact as FileContract,
  Receipt,
  Wallet,
  ShoppingCart,
  Users2,
  MessageSquare,
  MessageCircle,
  Megaphone,
  Palette,
  Table,
  Search,
  UserPlus,
  DollarSign,
  Star,
} from "lucide-react";
import { NotificationsDropdown } from "@/components/dashboard/NotificationsDropdown";
import { UserProfileDropdown } from "@/components/dashboard/UserProfileDropdown";
import { QuickAction } from "@/components/quick-actions/QuickAction";
import { SalesChart } from "@/components/sales/SalesChart";
import { CurrentBalanceCard } from "@/components/finance/CurrentBalanceCard";
import { LineChart } from "@/components/ui/Charts";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
  const router = useRouter();
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");

  // Updated mock data for metrics
  const todayMetrics = {
    appointments: {
      value: 12,
      change: "+2",
      trend: "+12%",
      label: t("home.metrics.appointments"),
    },
    newLeads: {
      value: 28,
      pending: 7,
      trend: "+12%",
      label: t("home.metrics.newLeads"),
    },
    dailySales: {
      value: 3450,
      trend: "+15%",
      label: t("home.metrics.dailySales"),
      data: {
        weekly: [2800, 3100, 2900, 3300, 3450, 3200, 3500],
        monthly: [85000, 92000, 88000, 95000, 102000, 98000],
        yearly: [980000, 1050000, 1120000, 1180000, 1250000],
      },
    },
    currentBalance: {
      value: 12380,
      lastUpdate: "5min",
      trend: "-8%",
      label: t("home.metrics.currentBalance"),
    },
  };

  const weeklyStats = {
    sales: {
      value: 24580,
      trend: "+12.3%",
      label: "Vendas Semanais",
      data: [4500, 5200, 4800, 5800, 6000, 5500, 6200],
    },
    newClients: {
      value: 142,
      trend: "+8.1%",
      label: "Novos Clientes",
      data: [18, 22, 19, 25, 21, 24, 28],
    },
  };

  // Chart options
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
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const clientsChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Recent Activities
  const recentActivities = [
    {
      icon: UserPlus,
      text: "Novo cliente cadastrado: Maria Silva",
      time: "5 min atrás",
    },
    {
      icon: DollarSign,
      text: "Pagamento recebido: R$ 450,00",
      time: "15 min atrás",
    },
    {
      icon: CalendarIcon,
      text: "Agendamento confirmado: João Santos",
      time: "30 min atrás",
    },
    {
      icon: Star,
      text: "Nova avaliação 5 estrelas recebida",
      time: "1 hora atrás",
    },
  ];

  // Module navigation
  const modules = [
    {
      icon: CalendarIcon,
      label: t("home.modules.calendar"),
      notification: 3,
      onClick: () => router.push("/calendar"),
    },
    {
      icon: Users,
      label: t("home.modules.clients"),
      onClick: () => router.push("/clients"),
    },
    {
      icon: Package,
      label: t("home.modules.products"),
      onClick: () => router.push("/products"),
    },
    {
      icon: FileText,
      label: t("home.modules.serviceOrders"),
      notification: 2,
      onClick: () => router.push("/service-orders"),
    },
    {
      icon: FileContract,
      label: t("home.modules.contracts"),
      onClick: () => router.push("/contracts"),
    },
    {
      icon: Receipt,
      label: t("home.modules.receipts"),
      onClick: () => router.push("/receipts"),
    },
    {
      icon: Wallet,
      label: t("home.modules.finance"),
      onClick: () => router.push("/finance"),
    },
    {
      icon: ShoppingCart,
      label: t("home.modules.sales"),
      onClick: () => router.push("/sales"),
    },
    {
      icon: Users2,
      label: t("home.modules.suppliers"),
      onClick: () => router.push("/suppliers"),
    },
    {
      icon: MessageSquare,
      label: t("home.modules.crm"),
      notification: 5,
      onClick: () => router.push("/crm"),
    },
    {
      icon: MessageCircle,
      label: t("home.modules.whatsapp"),
      notification: 1,
      onClick: () => router.push("/whatsapp"),
    },
    {
      icon: Megaphone,
      label: t("home.modules.campaigns"),
      onClick: () => router.push("/campaigns"),
    },
    {
      icon: Palette,
      label: t("home.modules.creatives"),
    },
    {
      icon: Table,
      label: t("home.modules.tables"),
      onClick: () => router.push("/tables"),
    },
  ];

  // Quick actions for the dashboard
  const quickActions = [
    {
      icon: Users,
      label: "+ Cliente",
      onClick: () => router.push("/clients/new"),
    },
    {
      icon: FileText,
      label: "+ O.S.",
      onClick: () => router.push("/service-orders/new"),
    },
    {
      icon: Receipt,
      label: "Emitir Recibo",
      onClick: () => router.push("/receipts/new"),
    },
    {
      icon: Wallet,
      label: "Gerar LinkPix",
      onClick: () => router.push("/finance/generate-pix"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1
              onClick={() => router.push("/")}
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              {t("home.title")}
            </h1>

            <div className="flex-1 max-w-2xl mx-auto px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("home.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <NotificationsDropdown />
              <UserProfileDropdown
                onSettingsClick={() => router.push("/settings")}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className="bg-white rounded-lg p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => router.push("/calendar")}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-50 rounded">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {todayMetrics.appointments.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">
                {todayMetrics.appointments.value}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-green-600">
                  {todayMetrics.appointments.trend}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {todayMetrics.appointments.change} comparado a ontem
            </p>
          </div>

          <div
            className="bg-white rounded-lg p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => router.push("/crm")}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {todayMetrics.newLeads.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">
                {todayMetrics.newLeads.value}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-green-600">
                  {todayMetrics.newLeads.trend}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {todayMetrics.newLeads.pending} aguardando contato
            </p>
          </div>

          <div
            className="bg-white rounded-lg p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => router.push("/sales")}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {todayMetrics.dailySales.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(todayMetrics.dailySales.value)}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-green-600">
                  {todayMetrics.dailySales.trend}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">que ontem</p>
          </div>

          <CurrentBalanceCard
            value={todayMetrics.currentBalance.value}
            lastUpdate={todayMetrics.currentBalance.lastUpdate}
            trend={todayMetrics.currentBalance.trend}
            onClick={() => router.push("/finance")}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SalesChart
              data={todayMetrics.dailySales.data}
              trend={todayMetrics.dailySales.trend}
              value={todayMetrics.dailySales.value}
            />

            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Novos Clientes
                </h3>
                <span className="text-xs font-medium text-green-600">
                  {weeklyStats.newClients.trend}
                </span>
              </div>
              <div className="text-2xl font-semibold mb-4">
                {weeklyStats.newClients.value}
              </div>
              <div className="h-40">
                <LineChart
                  data={{
                    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
                    datasets: [
                      {
                        data: weeklyStats.newClients.data,
                        borderColor: "#10B981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={clientsChartOptions}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Atividade Recente
              </h3>
              <button
                onClick={() => router.push("/activities")}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 border border-gray-100 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Modules */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Módulos do Sistema
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {modules.map((module, index) => (
              <QuickAction
                key={index}
                icon={module.icon}
                label={module.label}
                notification={module.notification}
                onClick={module.onClick}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
