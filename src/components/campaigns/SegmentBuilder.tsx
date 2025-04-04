import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Save,
  X,
  Users,
  Calendar,
  BarChart2,
  Edit,
} from "lucide-react";
import type { SegmentCondition } from "../../types/campaigns";

interface Segment {
  id: string;
  name: string;
  description: string;
  type: "active_clients" | "inactive_leads" | "vip_clients" | "custom";
  conditions: SegmentCondition[];
  totalContacts: number;
  createdAt: Date;
  updatedAt: Date;
}

export function SegmentBuilder() {
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      name: "Leads Inativos 30d",
      description: "Leads sem interação nos últimos 30 dias",
      type: "inactive_leads",
      conditions: [
        {
          field: "lastActivity",
          operator: "less_than",
          value: "30d",
        },
      ],
      totalContacts: 145,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [showNewSegment, setShowNewSegment] = useState(false);
  const [showSegmentDetails, setShowSegmentDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | Segment["type"]>("all");
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    type: "custom" as Segment["type"],
    conditions: [] as SegmentCondition[],
  });

  const [newCondition, setNewCondition] = useState({
    field: "",
    operator: "equals" as SegmentCondition["operator"],
    value: "",
  });

  const handleAddCondition = () => {
    if (newCondition.field && newCondition.value) {
      setNewSegment({
        ...newSegment,
        conditions: [...newSegment.conditions, { ...newCondition }],
      });
      setNewCondition({ field: "", operator: "equals", value: "" });
    }
  };

  const handleRemoveCondition = (index: number) => {
    setNewSegment({
      ...newSegment,
      conditions: newSegment.conditions.filter((_, i) => i !== index),
    });
  };

  const handleSaveSegment = () => {
    const segment: Segment = {
      id: Math.random().toString(),
      ...newSegment,
      totalContacts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSegments([...segments, segment]);
    setNewSegment({
      name: "",
      description: "",
      type: "custom",
      conditions: [],
    });
    setShowNewSegment(false);
  };

  const handleSegmentClick = (segment: Segment) => {
    setSelectedSegment(segment);
    setShowSegmentDetails(true);
  };

  const handleEditSegment = () => {
    if (selectedSegment) {
      setNewSegment({
        name: selectedSegment.name,
        description: selectedSegment.description,
        type: selectedSegment.type,
        conditions: selectedSegment.conditions,
      });
      setShowSegmentDetails(false);
      setShowNewSegment(true);
      setIsEditing(true);
    }
  };

  const handleUpdateSegment = () => {
    if (selectedSegment) {
      const updatedSegments = segments.map((segment) =>
        segment.id === selectedSegment.id
          ? {
              ...segment,
              ...newSegment,
              updatedAt: new Date(),
            }
          : segment
      );
      setSegments(updatedSegments);
      setShowNewSegment(false);
      setIsEditing(false);
      setSelectedSegment(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Segmentos</h3>
        <button
          onClick={() => {
            setShowNewSegment(true);
            setIsEditing(false);
            setNewSegment({
              name: "",
              description: "",
              type: "custom",
              conditions: [],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Novo Segmento
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar segmentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "all" | Segment["type"])
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="active_clients">Clientes Ativos</option>
            <option value="inactive_leads">Leads Inativos</option>
            <option value="vip_clients">Clientes VIP</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <div
            key={segment.id}
            onClick={() => handleSegmentClick(segment)}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {segment.name}
                </h4>
                <p className="text-sm text-gray-500">{segment.description}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  segment.type === "active_clients"
                    ? "bg-green-100 text-green-800"
                    : segment.type === "inactive_leads"
                      ? "bg-yellow-100 text-yellow-800"
                      : segment.type === "vip_clients"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {segment.type === "active_clients"
                  ? "Clientes Ativos"
                  : segment.type === "inactive_leads"
                    ? "Leads Inativos"
                    : segment.type === "vip_clients"
                      ? "Clientes VIP"
                      : "Personalizado"}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {segment.conditions.map((condition, index) => (
                <div
                  key={index}
                  className="text-sm bg-gray-50 p-2 rounded flex items-center justify-between"
                >
                  <span>
                    {condition.field} {condition.operator}{" "}
                    {condition.value as string}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{segment.totalContacts} contatos</span>
              <span>
                Criado em {new Date(segment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Segment Details Modal */}
      {showSegmentDetails && selectedSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{selectedSegment.name}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditSegment}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowSegmentDetails(false);
                    setSelectedSegment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                <p className="mt-1 text-base text-gray-900">
                  {selectedSegment.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Estatísticas
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Contatos</span>
                    </div>
                    <span className="text-xl font-semibold">
                      {selectedSegment.totalContacts}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Criado</span>
                    </div>
                    <span className="text-sm">
                      {new Date(selectedSegment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <BarChart2 className="w-4 h-4" />
                      <span className="text-sm">Campanhas</span>
                    </div>
                    <span className="text-xl font-semibold">3</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Condições
                </h3>
                <div className="space-y-2">
                  {selectedSegment.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {condition.field}
                        </span>
                        <span className="text-sm text-gray-500">
                          {condition.operator}
                        </span>
                        <span className="text-sm">
                          {condition.value as string}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Últimas Atualizações
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Última atualização em{" "}
                    {new Date(selectedSegment.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Segment Modal */}
      {showNewSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Editar Segmento" : "Novo Segmento"}
              </h2>
              <button
                onClick={() => {
                  setShowNewSegment(false);
                  setIsEditing(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  value={newSegment.name}
                  onChange={(e) =>
                    setNewSegment({ ...newSegment, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={newSegment.description}
                  onChange={(e) =>
                    setNewSegment({
                      ...newSegment,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={newSegment.type}
                  onChange={(e) =>
                    setNewSegment({
                      ...newSegment,
                      type: e.target.value as Segment["type"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="active_clients">Clientes Ativos</option>
                  <option value="inactive_leads">Leads Inativos</option>
                  <option value="vip_clients">Clientes VIP</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condições
                </label>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={newCondition.field}
                      onChange={(e) =>
                        setNewCondition({
                          ...newCondition,
                          field: e.target.value,
                        })
                      }
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Selecione um campo</option>
                      <option value="lastActivity">Última Atividade</option>
                      <option value="totalPurchases">Total de Compras</option>
                      <option value="averageTicket">Ticket Médio</option>
                      <option value="source">Origem</option>
                    </select>
                    <select
                      value={newCondition.operator}
                      onChange={(e) =>
                        setNewCondition({
                          ...newCondition,
                          operator: e.target
                            .value as SegmentCondition["operator"],
                        })
                      }
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="equals">Igual a</option>
                      <option value="contains">Contém</option>
                      <option value="greater_than">Maior que</option>
                      <option value="less_than">Menor que</option>
                      <option value="between">Entre</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCondition.value}
                        onChange={(e) =>
                          setNewCondition({
                            ...newCondition,
                            value: e.target.value,
                          })
                        }
                        placeholder="Valor"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCondition}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {newSegment.conditions.length > 0 && (
                    <div className="space-y-2">
                      {newSegment.conditions.map((condition, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">
                            {condition.field} {condition.operator}{" "}
                            {condition.value as string}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(index)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSegment(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={isEditing ? handleUpdateSegment : handleSaveSegment}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? "Atualizar" : "Salvar"} Segmento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
