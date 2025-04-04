"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ServiceOrdersTable from "@/components/service-order/ServiceOrdersTable";
import {
  ServiceOrderModal,
  type ServiceOrder,
} from "@/components/service-order/ServiceOrderModal";
import { useToast } from "@/components/ui/use-toast";
import {
  usePaginatedServiceOrders,
  useCreateServiceOrder,
  useUpdateServiceOrder,
  useDeleteServiceOrder,
  useBulkDeleteServiceOrders,
  useServiceOrderSearch,
} from "@/hooks/useServiceOrders";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ServiceOrdersPage() {
  const router = useRouter();
  const t = useTranslations();
  const [showServiceOrderModal, setShowServiceOrderModal] = useState(false);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<
    ServiceOrder | undefined
  >();
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch service orders with pagination
  const { data: serviceOrdersData, isLoading } = usePaginatedServiceOrders(
    pageSize,
    currentPage
  );

  // Generate flat list of service orders from paginated data
  const serviceOrders = React.useMemo(() => {
    if (!serviceOrdersData) return [];
    return serviceOrdersData.pages.flatMap(
      (page) => page.data as ServiceOrder[]
    );
  }, [serviceOrdersData]);

  // Get the total count from the latest page
  const totalCount = React.useMemo(() => {
    if (!serviceOrdersData?.pages || serviceOrdersData.pages.length === 0)
      return 0;
    return serviceOrdersData.pages[0].totalCount;
  }, [serviceOrdersData]);

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
          serviceOrders={serviceOrders}
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
          onPageSizeChange={setPageSize}
          currentPageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={currentPage}
          useServerSearch={useServiceOrderSearch}
        />
      </main>

      {showServiceOrderModal && (
        <ServiceOrderModal
          serviceOrder={selectedServiceOrder}
          onClose={() => {
            setShowServiceOrderModal(false);
            setSelectedServiceOrder(undefined);
          }}
          onSave={handleSaveServiceOrder}
          open={showServiceOrderModal}
          isMutating={
            createServiceOrder.isPending || updateServiceOrder.isPending
          }
        />
      )}
    </div>
  );
}
