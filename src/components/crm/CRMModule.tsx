import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { LeadsFunnel } from "./LeadsFunnel";
import { LeadsList } from "./LeadsList";
import { LeadModal } from "./LeadModal";
import { AutomationRules } from "./AutomationRules";
import { CRMDashboard } from "./CRMDashboard";
import type { Lead } from "../../types/crm";

export function CRMModule() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">CRM</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="funnel">Funil de Vendas</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="automations">Automações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <CRMDashboard />
          </TabsContent>

          <TabsContent value="funnel">
            <LeadsFunnel
              onLeadClick={(lead) => {
                setSelectedLead(lead);
                setShowLeadModal(true);
              }}
            />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsList
              onNewLead={() => {
                setSelectedLead(undefined);
                setShowLeadModal(true);
              }}
              onEditLead={(lead) => {
                setSelectedLead(lead);
                setShowLeadModal(true);
              }}
            />
          </TabsContent>

          <TabsContent value="automations">
            <AutomationRules />
          </TabsContent>
        </Tabs>
      </div>

      {showLeadModal && (
        <LeadModal
          lead={selectedLead}
          onClose={() => {
            setShowLeadModal(false);
            setSelectedLead(undefined);
          }}
          onSave={(leadData) => {
            // Handle save
            setShowLeadModal(false);
            setSelectedLead(undefined);
          }}
        />
      )}
    </div>
  );
}
