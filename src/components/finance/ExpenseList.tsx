import React, { useState } from "react";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { Expense } from "../../types/finance";

export function ExpenseList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState<"fixed" | "variable" | "all">(
    "all"
  );

  // Mock data - replace with real data from your state management
  const expenses: Expense[] = [
    {
      id: "1",
      description: "Aluguel",
      category: "rent",
      type: "fixed",
      amount: 2500.0,
      dueDate: new Date(),
      status: "paid",
      paymentDate: new Date(),
      recurrent: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Despesas</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200">
          <Plus className="w-5 h-5" />
          Nova Despesa
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar despesas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">Todas as Categorias</option>
          <option value="rent">Aluguel</option>
          <option value="utilities">Utilidades</option>
          <option value="supplies">Suprimentos</option>
          <option value="marketing">Marketing</option>
          <option value="payroll">Folha de Pagamento</option>
        </select>
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as "fixed" | "variable" | "all")
          }
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">Todos os Tipos</option>
          <option value="fixed">Fixas</option>
          <option value="variable">Variáveis</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recorrente
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.dueDate.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {expense.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      expense.category === "rent"
                        ? "bg-blue-100 text-blue-800"
                        : expense.category === "utilities"
                        ? "bg-green-100 text-green-800"
                        : expense.category === "supplies"
                        ? "bg-yellow-100 text-yellow-800"
                        : expense.category === "marketing"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {expense.category === "rent"
                      ? "Aluguel"
                      : expense.category === "utilities"
                      ? "Utilidades"
                      : expense.category === "supplies"
                      ? "Suprimentos"
                      : expense.category === "marketing"
                      ? "Marketing"
                      : expense.category === "payroll"
                      ? "Folha de Pagamento"
                      : "Outro"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      expense.type === "fixed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {expense.type === "fixed" ? "Fixa" : "Variável"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      expense.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : expense.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {expense.status === "paid"
                      ? "Pago"
                      : expense.status === "pending"
                      ? "Pendente"
                      : "Atrasado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.recurrent ? "Sim" : "Não"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
