import React, { useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

interface CurrentBalanceCardProps {
  value: number;
  lastUpdate: string;
  trend: string;
  onClick?: () => void;
}

export function CurrentBalanceCard({
  value,
  lastUpdate,
  trend,
  onClick,
}: CurrentBalanceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [lastUpdateTime, setLastUpdateTime] = useState(lastUpdate);
  const [currentTrend, setCurrentTrend] = useState(trend);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);

    try {
      // Simulate API call to get updated balance
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update with new random value for demonstration
      const variation = Math.random() * 1000 - 500;
      const newValue = Math.max(0, currentValue + variation);
      const trendPercentage = (
        ((newValue - currentValue) / currentValue) *
        100
      ).toFixed(1);

      setCurrentValue(newValue);
      setCurrentTrend(`${trendPercentage}%`);
      setLastUpdateTime("agora");
    } finally {
      setIsRefreshing(false);
    }
  };

  const trendIsPositive = !currentTrend.startsWith("-");

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200 relative group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded">
            <Wallet className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-600">Saldo Atual</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-all duration-200 hover:bg-gray-100 ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Atualizar saldo"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(currentValue)}
        </span>
        <div className="flex items-center gap-1">
          {trendIsPositive ? (
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          )}
          <span
            className={`text-xs font-medium ${
              trendIsPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {currentTrend}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-gray-500">
          Atualizado {lastUpdateTime}
        </span>
        <div className="flex-1 border-b border-dotted border-gray-200"></div>
      </div>
    </div>
  );
}
