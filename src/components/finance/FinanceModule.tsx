import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { IncomeList } from "./IncomeList";
import { ExpenseList } from "./ExpenseList";
import { BankReconciliation } from "./BankReconciliation";
import { FinancialReports } from "./FinancialReports";
import { FinancialDashboard } from "./FinancialDashboard";
import type { Income, Expense, BankTransaction } from "../../types/finance";

export function FinanceModule() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Financeiro
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 gap-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="reconciliation">Conciliação</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="income">
            <IncomeList />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseList />
          </TabsContent>

          <TabsContent value="reconciliation">
            <BankReconciliation />
          </TabsContent>

          <TabsContent value="reports">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
