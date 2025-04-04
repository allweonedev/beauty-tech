"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ServiceOrdersTable } from "@/components/service-order/ServiceOrdersTable";
import { ServiceOrderModal } from "@/components/service-order/ServiceOrderModal";
import { useToast } from "@/components/ui/use-toast";
import {
  useServiceOrders,
  useCreateServiceOrder,
  useUpdateServiceOrder,
  useDeleteServiceOrder,
  useBulkDeleteServiceOrders,
} from "@/hooks/useServiceOrders";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import type { ServiceOrder } from "@/components/service-order/ServiceOrderModal";
import type { Client } from "@/types";
import type { Product } from "@/types";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ServiceOrdersPage() {
  const router = useRouter();
  const t = useTranslations();
  const [showServiceOrderModal, setShowServiceOrderModal] = useState(false);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<
    ServiceOrder | undefined
  >();
  const { toast } = useToast();

  // Fetch service orders, clients, and products data
  const { data: serviceOrders = [], isLoading } = useServiceOrders();
  const { data: clients = [] } = useClients();
  const { data: products = [] } = useProducts();

  // Mutations
  const createServiceOrder = useCreateServiceOrder();
  const updateServiceOrder = useUpdateServiceOrder();
  const deleteServiceOrder = useDeleteServiceOrder();
  const bulkDeleteServiceOrders = useBulkDeleteServiceOrders();

  // Handle service order creation and updates
  const handleSaveServiceOrder = (serviceOrderData: Partial<ServiceOrder>) => {
    if (selectedServiceOrder) {
      // Update existing service order
      updateServiceOrder.mutate(
        {
          id: selectedServiceOrder.id,
          data: serviceOrderData,
        },
        {
          onSuccess: () => {
            toast({
              title: t("serviceOrders.editServiceOrder"),
              description: t("serviceOrders.editSuccess"),
            });
          },
          onError: () => {
            toast({
              title: t("common.error"),
              description: t("serviceOrders.editError"),
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create new service order
      createServiceOrder.mutate(serviceOrderData as ServiceOrder, {
        onSuccess: () => {
          toast({
            title: t("serviceOrders.newServiceOrder"),
            description: t("serviceOrders.createSuccess"),
          });
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("serviceOrders.createError"),
            variant: "destructive",
          });
        },
      });
    }

    // Close modal
    setShowServiceOrderModal(false);
    setSelectedServiceOrder(undefined);
  };

  // Handle service order deletion
  const handleDeleteServiceOrder = (serviceOrderId: string) => {
    if (confirm(t("serviceOrders.deleteConfirm.message"))) {
      deleteServiceOrder.mutate(serviceOrderId, {
        onSuccess: () => {
          toast({
            title: t("serviceOrders.deleteServiceOrder"),
            description: t("serviceOrders.deleteSuccess"),
          });
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("serviceOrders.deleteError"),
            variant: "destructive",
          });
        },
      });
    }
  };

  // Handle bulk service order deletion
  const handleBulkDeleteServiceOrders = async (serviceOrderIds: string[]) => {
    if (!serviceOrderIds || serviceOrderIds.length === 0) return;

    try {
      await bulkDeleteServiceOrders.mutateAsync(serviceOrderIds);

      toast({
        title: t("serviceOrders.deleteServiceOrder"),
        description: t("serviceOrders.deleteSuccess"),
      });
    } catch (error) {
      console.error("Error deleting service orders:", error);

      toast({
        title: t("common.error"),
        description: t("serviceOrders.deleteError"),
        variant: "destructive",
      });
    }
  };

  // Is any mutation in progress?
  const isMutating =
    createServiceOrder.isPending ||
    updateServiceOrder.isPending ||
    deleteServiceOrder.isPending ||
    bulkDeleteServiceOrders.isPending;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1
                onClick={() => router.push("/")}
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
              >
                {t("home.title")}
              </h1>
              <span className="mx-2">›</span>
              <div className="text-lg font-medium text-gray-700">
                {t("serviceOrders.title")}
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ServiceOrdersTable
          serviceOrders={serviceOrders as ServiceOrder[]}
          isLoading={isLoading}
          isMutating={isMutating}
          onNewServiceOrder={() => {
            setSelectedServiceOrder(undefined);
            setShowServiceOrderModal(true);
          }}
          onEditServiceOrder={(serviceOrder: ServiceOrder) => {
            setSelectedServiceOrder(serviceOrder);
            setShowServiceOrderModal(true);
          }}
          onDeleteServiceOrder={handleDeleteServiceOrder}
          onBulkDeleteServiceOrders={handleBulkDeleteServiceOrders}
        />
      </main>

      {showServiceOrderModal && (
        <ServiceOrderModal
          serviceOrder={selectedServiceOrder}
          clients={clients as unknown as Client[]}
          products={products as unknown as Product[]}
          open={showServiceOrderModal}
          isMutating={isMutating}
          onClose={() => {
            setShowServiceOrderModal(false);
            setSelectedServiceOrder(undefined);
          }}
          onSave={handleSaveServiceOrder}
        />
      )}
    </div>
  );
}
