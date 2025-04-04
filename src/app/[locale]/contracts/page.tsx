"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ContractsTable from "@/components/contract/ContractsTable";
import { ContractModal } from "@/components/contract/ContractModal";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateContract,
  useUpdateContract,
  usePaginatedContracts,
  useBulkDeleteContracts,
  useContractSearch,
} from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { type Contract } from "@/types/contract";

export default function ContractsPage() {
  const router = useRouter();
  const t = useTranslations();
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<
    Contract | undefined
  >();
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch contracts data
  const { data: contractsData, isLoading: contractsLoading } =
    usePaginatedContracts(pageSize, currentPage);

  // Generate flat list of contracts from paginated data
  const contracts = React.useMemo(() => {
    if (!contractsData) return [];
    return contractsData.pages.flatMap((page) => page.data as Contract[]);
  }, [contractsData]);

  // Get the total count from the latest page
  const totalCount = React.useMemo(() => {
    if (!contractsData?.pages || contractsData.pages.length === 0) return 0;
    return contractsData.pages[0].totalCount;
  }, [contractsData]);

  // Fetch clients data (for the contract modal)
  const { data: clients = [], isLoading: clientsLoading } = useClients();

  // Mutations
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const bulkDeleteContracts = useBulkDeleteContracts();

  // Handle contract creation and updates
  const handleSaveContract = (contractData: Partial<Contract>) => {
    if (selectedContract) {
      // Update existing contract
      updateContract.mutate(
        {
          id: selectedContract.id,
          data: contractData,
        },
        {
          onSuccess: () => {
            toast({
              title: t("contracts.editContract"),
              description: t("contracts.editSuccess"),
            });
          },
          onError: () => {
            toast({
              title: t("common.error"),
              description: t("contracts.editError"),
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create new contract
      createContract.mutate(contractData, {
        onSuccess: () => {
          toast({
            title: t("contracts.newContract"),
            description: t("contracts.createSuccess"),
          });
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("contracts.createError"),
            variant: "destructive",
          });
        },
      });
    }

    // Close modal
    setShowContractModal(false);
    setSelectedContract(undefined);
  };

  // Is any mutation in progress?
  const isMutating =
    createContract.isPending ||
    updateContract.isPending ||
    clientsLoading ||
    bulkDeleteContracts.isPending;

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
                {t("contracts.title")}
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ContractsTable
          contracts={contracts}
          isLoading={contractsLoading}
          isMutating={isMutating}
          onNewContract={() => {
            setSelectedContract(undefined);
            setShowContractModal(true);
          }}
          onEditContract={(contract) => {
            setSelectedContract(contract);
            setShowContractModal(true);
          }}
          onPageSizeChange={setPageSize}
          currentPageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={currentPage}
          useServerSearch={useContractSearch}
        />
      </main>

      <ContractModal
        contract={selectedContract}
        clients={clients}
        open={showContractModal}
        isMutating={isMutating}
        onClose={() => {
          setShowContractModal(false);
          setSelectedContract(undefined);
        }}
        onSave={handleSaveContract}
      />
    </div>
  );
}
