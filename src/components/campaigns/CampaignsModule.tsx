import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { CampaignsList } from "./CampaignsList";
import { CampaignModal } from "./CampaignModal";
import { CampaignsDashboard } from "./CampaignsDashboard";
import { SegmentBuilder } from "./SegmentBuilder";
import type { Campaign } from "../../types/campaigns";

export function CampaignsModule() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<
    Campaign | undefined
  >();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Campanhas</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 gap-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="segments">Segmentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <CampaignsDashboard />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsList
              onNewCampaign={() => {
                setSelectedCampaign(undefined);
                setShowCampaignModal(true);
              }}
              onEditCampaign={(campaign) => {
                setSelectedCampaign(campaign);
                setShowCampaignModal(true);
              }}
            />
          </TabsContent>

          <TabsContent value="segments">
            <SegmentBuilder />
          </TabsContent>
        </Tabs>
      </div>

      {showCampaignModal && (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(undefined);
          }}
          onSave={(campaignData) => {
            // Handle save
            setShowCampaignModal(false);
            setSelectedCampaign(undefined);
          }}
        />
      )}
    </div>
  );
}
