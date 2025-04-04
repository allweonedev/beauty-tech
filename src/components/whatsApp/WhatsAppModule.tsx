import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { WhatsAppChat } from "./WhatsAppChat";
import { WhatsAppContacts } from "./WhatsAppContacts";
import { WhatsAppTemplates } from "./WhatsAppTemplates";
import { WhatsAppDashboard } from "./WhatsAppDashboard";
import type { WhatsAppContact, WhatsAppMessage } from "../../types/whatsapp";

export function WhatsAppModule() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedContact, setSelectedContact] =
    useState<WhatsAppContact | null>(null);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">WhatsApp</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <WhatsAppDashboard />
          </TabsContent>

          <TabsContent value="chat">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 border-r">
                <WhatsAppContacts
                  onSelectContact={setSelectedContact}
                  selectedContact={selectedContact}
                />
              </div>
              <div className="col-span-8">
                {selectedContact ? (
                  <WhatsAppChat contact={selectedContact} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Selecione um contato para iniciar a conversa
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <WhatsAppContacts
              onSelectContact={setSelectedContact}
              selectedContact={selectedContact}
              fullWidth
            />
          </TabsContent>

          <TabsContent value="templates">
            <WhatsAppTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
