import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Search,
  Filter,
  MoreVertical,
  MessageSquare,
  Calendar,
  Send,
} from "lucide-react";
import type { Lead, LeadStage } from "../../types/crm";

interface LeadsFunnelProps {
  onLeadClick: (lead: Lead) => void;
}

const stages: { id: LeadStage; label: string }[] = [
  { id: "new_contact", label: "Novo Contato" },
  { id: "interested", label: "Interessado" },
  { id: "negotiation", label: "Negociação" },
  { id: "payment", label: "Pagamento" },
  { id: "closed", label: "Fechado" },
];

export function LeadsFunnel({ onLeadClick }: LeadsFunnelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");

  // Mock data - replace with real data from your state management
  const leads: Lead[] = [
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(41) 99999-9999",
      source: "website",
      stage: "new_contact",
      profile: {
        type: "hot",
        potentialValue: 1500,
        interests: ["aesthetic", "facial"],
        responseTime: 2,
      },
      interactions: [],
      automations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["new", "website"],
      notes: "",
    },
  ];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // In a real app, update the lead's stage in your state management
    console.log(
      `Moving lead from ${source.droppableId} to ${destination.droppableId}`
    );
  };

  const getLeadsByStage = (stage: LeadStage) => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource =
        filterSource === "all" || lead.source === filterSource;

      return lead.stage === stage && matchesSearch && matchesSource;
    });
  };

  const handleQuickAction = (
    e: React.MouseEvent,
    lead: Lead,
    action: string
  ) => {
    e.stopPropagation();
    switch (action) {
      case "message":
        // Handle sending message
        break;
      case "schedule":
        // Handle scheduling
        break;
      case "automate":
        // Handle automation
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todas as Origens</option>
            <option value="website">Website</option>
            <option value="social">Redes Sociais</option>
            <option value="referral">Indicação</option>
            <option value="other">Outros</option>
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {stage.label}
                </h3>
                <span className="text-xs font-medium text-gray-500">
                  {getLeadsByStage(stage.id).length}
                </span>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {getLeadsByStage(stage.id).map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onLeadClick(lead)}
                            className="bg-white rounded-lg p-3 shadow-sm hover:shadow transition-shadow duration-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {lead.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {lead.email}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  lead.profile.type === "hot"
                                    ? "bg-red-100 text-red-800"
                                    : lead.profile.type === "warm"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {lead.profile.type.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>R$ {lead.profile.potentialValue}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) =>
                                    handleQuickAction(e, lead, "message")
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleQuickAction(e, lead, "schedule")
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleQuickAction(e, lead, "automate")
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
