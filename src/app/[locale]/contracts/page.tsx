"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ContractsTable } from "@/components/contract/ContractsTable";
import { ContractModal } from "@/components/contract/ContractModal";
import { useToast } from "@/components/ui/use-toast";
import { useCreateContract, useUpdateContract } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import type { Contract } from "@/components/contract/ContractModal";
import type { Client } from "@/types";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ContractsPage() {
  const router = useRouter();
  const t = useTranslations();
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<
    Contract | undefined
  >();
  const { toast } = useToast();

  // Fetch contracts data

  // Fetch clients data (for the contract modal)

  // Combined loading state

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  // Mutations
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();

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
    createContract.isPending || updateContract.isPending || clientsLoading;

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
        <ContractsTable />
      </main>

      <ContractModal
        contract={selectedContract}
        clients={clients as unknown as Client[]}
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
