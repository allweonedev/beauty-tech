import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { SuppliersList } from "./SuppliersList";
import { SupplierModal } from "./SupplierModal";
import { RentalHistory } from "./RentalHistory";
import { CommissionReports } from "./CommissionReports";
import type { Supplier } from "../../types/suppliers";

export function SuppliersModule() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<
    Supplier | undefined
  >();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Fornecedores
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 gap-4 mb-6">
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="rentals">Histórico de Locações</TabsTrigger>
            <TabsTrigger value="commissions">
              Relatório de Comissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers">
            <SuppliersList
              onNewSupplier={() => {
                setSelectedSupplier(undefined);
                setShowSupplierModal(true);
              }}
              onEditSupplier={(supplier) => {
                setSelectedSupplier(supplier);
                setShowSupplierModal(true);
              }}
            />
          </TabsContent>

          <TabsContent value="rentals">
            <RentalHistory />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionReports />
          </TabsContent>
        </Tabs>
      </div>

      {showSupplierModal && (
        <SupplierModal
          open={true}
          supplier={selectedSupplier}
          onClose={() => {
            setShowSupplierModal(false);
            setSelectedSupplier(undefined);
          }}
          onSave={(supplierData) => {
            // Handle save
            setShowSupplierModal(false);
            setSelectedSupplier(undefined);
          }}
        />
      )}
    </div>
  );
}
