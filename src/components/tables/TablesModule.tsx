import React, { useState } from "react";
import { Search, Filter, Download, Share2, QrCode, Plus } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { EquipmentModal } from "./EquipmentModal";

interface Equipment {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  availability: "available" | "rented" | "maintenance";
}

export function TablesModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState<
    Equipment | undefined
  >();
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  // Mock data - replace with real data from your state management
  const equipment: Equipment[] = [
    {
      id: "1",
      name: "Lavieen",
      description:
        "Equipamento profissional para tratamentos estéticos faciais e corporais",
      price: 1500.0,
      imageUrl:
        "https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?auto=format&fit=crop&q=80&w=600",
      category: "Facial",
      availability: "available",
    },
    {
      id: "2",
      name: "Criolipólise",
      description: "Sistema avançado para redução de gordura localizada",
      price: 2000.0,
      imageUrl:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600",
      category: "Corporal",
      availability: "rented",
    },
    {
      id: "3",
      name: "Microagulhamento",
      description:
        "Dispositivo para tratamento de rejuvenescimento e cicatrizes",
      price: 800.0,
      imageUrl:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
      category: "Facial",
      availability: "available",
    },
  ];

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    const matchesAvailability =
      filterAvailability === "all" || item.availability === filterAvailability;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleExportPDF = async () => {
    const element = document.getElementById("equipment-gallery");
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("tabela-equipamentos.pdf");
    }
  };

  const handleShareLink = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tabela de Equipamentos",
          text: "Confira nossa tabela de equipamentos",
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      void navigator.clipboard.writeText(shareUrl);
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleSaveEquipment = (equipmentData: Partial<Equipment>) => {
    // In a real app, update the equipment in your state management
    console.log("Saving equipment:", equipmentData);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Tabelas e Valores
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Download className="w-5 h-5" />
              Exportar PDF
            </button>
            <button
              onClick={handleShareLink}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>
            <button
              onClick={() => {
                setSelectedEquipment(undefined);
                setShowEquipmentModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              Novo Item
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Facial">Facial</option>
              <option value="Corporal">Corporal</option>
            </select>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos os Status</option>
              <option value="available">Disponível</option>
              <option value="rented">Alugado</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </div>
        </div>

        <div
          id="equipment-gallery"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedEquipment(item);
                setShowEquipmentModal(true);
              }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="aspect-w-16 aspect-h-9">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.availability === "available"
                        ? "bg-green-100 text-green-800"
                        : item.availability === "rented"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.availability === "available"
                      ? "Disponível"
                      : item.availability === "rented"
                        ? "Alugado"
                        : "Manutenção"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-indigo-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.price)}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    {item.category}
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle QR code generation
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <QrCode className="w-4 h-4" />
                    Gerar QR Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEquipmentModal && (
        <EquipmentModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowEquipmentModal(false);
            setSelectedEquipment(undefined);
          }}
          onSave={handleSaveEquipment}
        />
      )}
    </div>
  );
}
