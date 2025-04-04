import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { SalesList } from "./SalesList";
import { SaleModal } from "./SaleModal";
import { PaymentReminders } from "./PaymentReminders";
import type { Sale } from "../../types/sales";

export function SalesModule() {
  const [activeTab, setActiveTab] = useState("sales");
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vendas</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 gap-4 mb-6">
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="reminders">Cobranças</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SalesList
              onNewSale={() => {
                setSelectedSale(undefined);
                setShowSaleModal(true);
              }}
              onEditSale={(sale) => {
                setSelectedSale(sale);
                setShowSaleModal(true);
              }}
            />
          </TabsContent>

          <TabsContent value="reminders">
            <PaymentReminders />
          </TabsContent>
        </Tabs>
      </div>

      {showSaleModal && (
        <SaleModal
          sale={selectedSale}
          onClose={() => {
            setShowSaleModal(false);
            setSelectedSale(undefined);
          }}
          onSave={(saleData) => {
            // Handle save
            setShowSaleModal(false);
            setSelectedSale(undefined);
          }}
        />
      )}
    </div>
  );
}
