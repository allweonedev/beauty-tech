import React, { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import type { Supplier } from "../../types/suppliers";

interface SuppliersListProps {
  onNewSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
}

export function SuppliersList({
  onNewSupplier,
  onEditSupplier,
}: SuppliersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "partner" | "subcontractor"
  >("all");

  // Mock data - replace with real data from your state management
  const suppliers: Supplier[] = [
    {
      id: "1",
      name: "Equipamentos Premium Ltda",
      email: "contato@premium.com",
      phone: "(41) 99999-9999",
      cnpj: "12.345.678/0001-90",
      address: "Rua das Empresas, 123",
      type: "partner",
      commission: {
        percentage: 15,
        minimumValue: 100,
        maximumValue: 1000,
      },
      bankInfo: {
        bank: "Banco do Brasil",
        agency: "1234",
        account: "12345-6",
        type: "checking",
        pixKey: "premium@email.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.cnpj.includes(searchQuery);

    const matchesType = filterType === "all" || supplier.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Fornecedores</h3>
        <button
          onClick={onNewSupplier}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Novo Fornecedor
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CNPJ..."
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
              setFilterType(
                e.target.value as "all" | "partner" | "subcontractor"
              )
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="partner">Parceiros</option>
            <option value="subcontractor">Sublocados</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comissão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dados Bancários
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cadastro
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.map((supplier) => (
              <tr
                key={supplier.id}
                onClick={() => onEditSupplier(supplier)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {supplier.name}
                  </div>
                  <div className="text-sm text-gray-500">{supplier.cnpj}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supplier.email}</div>
                  <div className="text-sm text-gray-500">{supplier.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      supplier.type === "partner"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {supplier.type === "partner" ? "Parceiro" : "Sublocado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {supplier.commission.percentage}%
                  </div>
                  {(supplier.commission.minimumValue ??
                    supplier.commission.maximumValue) && (
                    <div className="text-xs text-gray-500">
                      {supplier.commission.minimumValue &&
                        `Min: R$ ${supplier.commission.minimumValue}`}
                      {supplier.commission.minimumValue &&
                        supplier.commission.maximumValue &&
                        " | "}
                      {supplier.commission.maximumValue &&
                        `Max: R$ ${supplier.commission.maximumValue}`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {supplier.bankInfo.bank}
                  </div>
                  <div className="text-sm text-gray-500">
                    Ag: {supplier.bankInfo.agency} | CC:{" "}
                    {supplier.bankInfo.account}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(supplier.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
