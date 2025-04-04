import React, { useState } from "react";
import { Search, Filter, Plus, Star, Clock } from "lucide-react";
import type { WhatsAppContact } from "../../types/whatsapp";

interface WhatsAppContactsProps {
  onSelectContact: (contact: WhatsAppContact) => void;
  selectedContact: WhatsAppContact | null;
  fullWidth?: boolean;
}

export function WhatsAppContacts({
  onSelectContact,
  selectedContact,
  fullWidth,
}: WhatsAppContactsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<
    "all" | WhatsAppContact["stage"]
  >("all");

  // Mock data - replace with real data from your state management
  const contacts: WhatsAppContact[] = [
    {
      id: "1",
      name: "Maria Silva",
      phone: "(41) 99999-9999",
      status: "active",
      lastActivity: new Date(),
      tags: ["new", "interested"],
      stage: "engaged",
      notes: "Interessada em tratamento facial",
    },
  ];

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    const matchesStage = filterStage === "all" || contact.stage === filterStage;

    return matchesSearch && matchesStage;
  });

  return (
    <div className={`space-y-4 ${fullWidth ? "w-full" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <button className="flex items-center gap-2 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar contatos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStage}
            onChange={(e) =>
              setFilterStage(e.target.value as "all" | WhatsAppContact["stage"])
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Estágios</option>
            <option value="new">Novo</option>
            <option value="engaged">Engajado</option>
            <option value="qualified">Qualificado</option>
            <option value="converted">Convertido</option>
            <option value="lost">Perdido</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
              selectedContact?.id === contact.id
                ? "bg-indigo-50"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{contact.name}</h4>
                <p className="text-sm text-gray-500">{contact.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    contact.status === "active"
                      ? "bg-green-500"
                      : contact.status === "inactive"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    contact.stage === "new"
                      ? "bg-gray-100 text-gray-800"
                      : contact.stage === "engaged"
                      ? "bg-blue-100 text-blue-800"
                      : contact.stage === "qualified"
                      ? "bg-green-100 text-green-800"
                      : contact.stage === "converted"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {contact.stage}
                </span>
              </div>
            </div>
            {contact.lastMessage && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                {contact.lastMessage.content}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
