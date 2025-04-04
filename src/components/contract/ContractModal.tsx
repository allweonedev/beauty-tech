"use client";
import React, { useState, useEffect } from "react";
import { Upload, FileText, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import type { Contract } from "@/types/contract";
import { useUploadThing } from "@/hooks/useUploadthing";
import { ClientSelect } from "@/components/selects/ClientSelect";

// Define a DTO interface for contract submission
interface ContractDTO {
  title: string;
  description: string;
  clientId: string;
  documentUrl?: string;
  status?: "pending" | "signed" | "expired" | "cancelled";
  expiresAt?: Date;
  updatedAt?: Date;
}

// Form validation schema
const contractFormSchema = z.object({
  title: z.string().min(1, {
    message: "Título é obrigatório",
  }),
  description: z.string().min(1, {
    message: "Descrição é obrigatória",
  }),
  clientId: z.string().min(1, {
    message: "Cliente é obrigatório",
  }),
  documentUrl: z.string().optional(),
  expiresAt: z.string().optional(),
});

// Form values type
type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractModalProps {
  contract?: Contract;
  onClose: () => void;
  onSave: (contract: ContractDTO) => void;
  open: boolean;
  isMutating?: boolean;
}

export function ContractModal({
  contract,
  onClose,
  onSave,
  open,
  isMutating,
}: ContractModalProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: uploadingInProgress } = useUploadThing(
    "documentUploader",
    {
      onClientUploadComplete: (res) => {
        if (res?.[0]) {
          form.setValue("documentUrl", res[0].url);
          setIsUploading(false);
        }
      },
      onUploadError: (error) => {
        toast({
          variant: "destructive",
          title: t("contracts.uploadError") ?? "Upload Error",
          description: error.message,
        });
        setIsUploading(false);
      },
    }
  );

  // Initialize form with default values
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      title: contract?.title ?? "",
      description: contract?.description ?? "",
      clientId: contract?.client?.id ?? "",
      documentUrl: contract?.documentUrl ?? "",
      expiresAt: contract?.expiresAt
        ? new Date(contract.expiresAt).toISOString().split("T")[0]
        : "",
    },
  });

  // Reset form values when contract changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: contract?.title ?? "",
        description: contract?.description ?? "",
        clientId: contract?.client?.id ?? "",
        documentUrl: contract?.documentUrl ?? "",
        expiresAt: contract?.expiresAt
          ? new Date(contract.expiresAt).toISOString().split("T")[0]
          : "",
      });
      setFile(null);
    }
  }, [contract, open, form]);

  // Form submission handler
  const onSubmit = async (data: ContractFormValues) => {
    try {
      // Upload document if it exists
      if (file) {
        setIsUploading(true);
        await startUpload([file]);
        // The URL will be set in the onClientUploadComplete callback
        // We'll wait for the upload to complete before proceeding
        return;
      }

      const contractData: ContractDTO = {
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        documentUrl: data.documentUrl,
        status: contract?.status ?? "pending",
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        updatedAt: new Date(),
      };

      console.log("Submitting contract data:", contractData);
      onSave(contractData);
      onClose();
    } catch (err) {
      console.error("Error saving contract:", err);
      toast({
        variant: "destructive",
        title: t("contracts.saveError") ?? "Erro ao salvar contrato",
        description: String(err),
      });
    }
  };

  // Watch for upload completion and submit the form
  useEffect(() => {
    if (isUploading && !uploadingInProgress) {
      try {
        // Upload finished, now submit form with the URL
        const data = form.getValues();

        const contractData: ContractDTO = {
          title: data.title,
          description: data.description,
          clientId: data.clientId,
          documentUrl: data.documentUrl,
          status: contract?.status ?? "pending",
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          updatedAt: new Date(),
        };

        onSave(contractData);
        onClose();
      } catch (err) {
        toast({
          variant: "destructive",
          title: t("contracts.saveError") ?? "Erro ao salvar contrato",
          description: String(err),
        });
        setIsUploading(false);
      }
    }
  }, [
    isUploading,
    uploadingInProgress,
    form,
    contract,
    t,
    toast,
    onSave,
    onClose,
  ]);

  // Form error handler
  const onError = (errors: FieldErrors<ContractFormValues>) => {
    // Get all error messages
    const errorMessages = Object.entries(errors)
      .map(([field, error]) => `${field}: ${error.message}`)
      .join(", ");

    toast({
      variant: "destructive",
      title:
        t("contracts.formValidationError") ?? "Erro de validação do formulário",
      description:
        errorMessages ??
        t("contracts.fixFormErrors") ??
        "Corrija os erros do formulário antes de enviar",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(files[0]);
      form.setValue("documentUrl", previewUrl);
    }
  };

  const handleSendForSignature = async () => {
    try {
      // In a real app, integrate with DocuSign API here
      toast({
        title: t("contracts.sentContract") ?? "Contrato enviado",
        description:
          t("contracts.sentForSignature") ??
          "Contrato enviado para assinatura digital!",
      });
    } catch (error) {
      console.error("Error sending for signature:", error);
      toast({
        variant: "destructive",
        title: t("common.error") ?? "Erro",
        description:
          t("contracts.signatureError") ??
          "Erro ao enviar para assinatura. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-full max-w-3xl bg-background max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {contract
              ? t("contracts.editContract") || "Editar Contrato"
              : t("contracts.newContract") || "Novo Contrato"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("contracts.form.title") || "Título"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          t("contracts.form.titlePlaceholder") ||
                          "Título do contrato"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("contracts.form.description") || "Descrição"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          t("contracts.form.descriptionPlaceholder") ||
                          "Descrição do contrato"
                        }
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("contracts.form.client") || "Cliente"}
                    </FormLabel>
                    <FormControl>
                      <ClientSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={
                          t("contracts.form.selectClient") ||
                          "Selecione um cliente"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("contracts.form.expirationDate") ||
                        "Data de Expiração"}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentUrl"
                render={({}) => (
                  <FormItem>
                    <FormLabel>
                      {t("contracts.form.document") || "Documento"}
                    </FormLabel>
                    <FormControl>
                      <div>
                        {contract?.documentUrl ? (
                          <div className="flex items-center justify-between p-4 bg-input rounded-lg">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-gray-500 mr-2" />
                              <span className="text-sm text-gray-900">
                                {t("contracts.currentDocument") ||
                                  "Documento atual"}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={contract.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                              >
                                {t("common.view") || "Visualizar"}
                              </a>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(contract.documentUrl, "_blank")
                                }
                              >
                                {t("common.download") || "Download"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                  <span>
                                    {t("contracts.uploadFile") ||
                                      "Upload do arquivo"}
                                  </span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                  />
                                </label>
                                <p className="pl-1">
                                  {t("contracts.dragAndDrop") ||
                                    "ou arraste e solte"}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500">
                                {t("contracts.acceptedFormats") ||
                                  "PDF, DOC até 10MB"}
                              </p>
                            </div>
                          </div>
                        )}
                        {file && (
                          <p className="mt-2 text-sm text-gray-500">
                            {t("contracts.selectedFile") ||
                              "Arquivo selecionado"}
                            : {file.name}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {contract?.status === "pending" && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={handleSendForSignature}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                  {t("contracts.sendForSignature") || "Enviar para Assinatura"}
                </Button>
              </div>
            )}

            <DialogFooter>
              <div className="w-full flex justify-between">
                {!contract && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      form.reset();
                      setFile(null);
                    }}
                  >
                    {t("common.clear") ?? "Limpar"}
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isMutating ?? isUploading}
                  >
                    {t("common.cancel") ?? "Cancelar"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isMutating ?? isUploading ?? uploadingInProgress}
                  >
                    {(isUploading ?? uploadingInProgress)
                      ? (t("common.uploading") ?? "Uploading...")
                      : isMutating
                        ? (t("common.saving") ?? "Salvando...")
                        : (t("common.save") ?? "Salvar")}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
