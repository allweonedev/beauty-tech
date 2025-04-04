"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ClientsList } from "@/components/client/ClientsTable";
import { ClientModal } from "@/components/client/ClientModal";
import { useToast } from "@/components/ui/use-toast";
import {
  usePaginatedClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useBulkDeleteClients,
} from "@/hooks/useClients";
import type { Client } from "@/types/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ClientsPage() {
  const router = useRouter();
  const t = useTranslations();
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch clients data
  const { data: clientsData, isLoading } = usePaginatedClients(
    pageSize,
    currentPage
  );

  // Generate flat list of clients from paginated data
  const clients = React.useMemo(() => {
    if (!clientsData) return [];
    return clientsData.pages.flatMap((page) => page.data as Client[]);
  }, [clientsData]);

  // Get the total count from the latest page
  const totalCount = React.useMemo(() => {
    if (!clientsData?.pages || clientsData.pages.length === 0) return 0;
    return clientsData.pages[0].totalCount;
  }, [clientsData]);

  // Mutations
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const bulkDeleteClients = useBulkDeleteClients();

  // Handle client creation and updates
  const handleSaveClient = (clientData: Partial<Client>) => {
    if (selectedClient) {
      // Update existing client
      updateClient.mutate(
        {
          id: selectedClient.id,
          data: clientData,
        },
        {
          onSuccess: () => {
            toast({
              title: t("clients.editClient"),
              description: t("clients.editSuccess"),
            });
          },
          onError: () => {
            toast({
              title: t("common.error"),
              description: t("clients.editError"),
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create new client
      createClient.mutate(clientData, {
        onSuccess: () => {
          toast({
            title: t("clients.newClient"),
            description: t("clients.createSuccess"),
          });
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("clients.createError"),
            variant: "destructive",
          });
        },
      });
    }

    // Close modal
    setShowClientModal(false);
    setSelectedClient(undefined);
  };

  // Is any mutation in progress?
  const isMutating =
    createClient.isPending ||
    updateClient.isPending ||
    deleteClient.isPending ||
    bulkDeleteClients.isPending;

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
                {t("clients.title")}
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientsList
          clients={clients}
          isLoading={isLoading}
          isMutating={isMutating}
          onNewClient={() => {
            setSelectedClient(undefined);
            setShowClientModal(true);
          }}
          onEditClient={(client: Client) => {
            setSelectedClient(client);
            setShowClientModal(true);
          }}
          onPageSizeChange={setPageSize}
          currentPageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={currentPage}
        />
      </main>

      <ClientModal
        client={selectedClient}
        open={showClientModal}
        isMutating={isMutating}
        onClose={() => {
          setShowClientModal(false);
          setSelectedClient(undefined);
        }}
        onSave={handleSaveClient}
      />
    </div>
  );
}
