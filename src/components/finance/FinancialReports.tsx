import React, { useState } from 'react';
import { Download, Calendar, Filter } from 'lucide-react';
import { BarChart, LineChart } from '../ui/Charts';

export function FinancialReports() {
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExportReport = () => {
    // In a real app, generate and download report
    alert('Relatório exportado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Relatórios Financeiros</h3>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Download className="w-5 h-5" />
          Exportar Relatório
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="daily">Diário</option>
          <option value="biweekly">Quinzenal</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
          <option value="custom">Personalizado</option>
        </select>

        {period === 'custom' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Fluxo de Caixa</h4>
          <LineChart
            data={{
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
              datasets: [{
                label: 'Saldo',
                data: [15000, 18000, 16000, 17500, 19000, 20000],
                borderColor: '#10B981',
                tension: 0.3
              }]
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Receitas por Método de Pagamento</h4>
          <BarChart
            data={{
              labels: ['PIX', 'Crédito', 'Débito', 'Dinheiro'],
              datasets: [{
                label: 'Valor',
                data: [12000, 8000, 6000, 4000],
                backgroundColor: '#4F46E5'
              }]
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4">Resumo Financeiro</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-500 mb-2">Total de Receitas</h5>
            <p className="text-2xl font-bold text-green-600">R$ 45.890,00</p>
            <p className="text-sm text-gray-500 mt-1">+15% que período anterior</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-500 mb-2">Total de Despesas</h5>
            <p className="text-2xl font-bold text-red-600">R$ 28.450,00</p>
            <p className="text-sm text-gray-500 mt-1">-8% que período anterior</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-500 mb-2">Lucro Líquido</h5>
            <p className="text-2xl font-bold text-indigo-600">R$ 17.440,00</p>
            <p className="text-sm text-gray-500 mt-1">+22% que período anterior</p>
          </div>
        </div>
      </div>
    </div>
  );
}