"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Upload, Plus } from "lucide-react";
import type { Client, Product } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUploadThing } from "@/hooks/useUploadthing";
import { useToast } from "@/components/ui/use-toast";
import { ClientSelect } from "@/components/selects/ClientSelect";
import { ProductSelect } from "@/components/selects/ProductSelect";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";

export interface ServiceOrder {
  id: string;
  number: string;
  client?: Client;
  clientId?: string;
  product?: Product;
  productId?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  scheduledDate?: Date;
  completedDate?: Date;
  description: string;
  technicalNotes: string;
  attachments: Attachment[];
  maintenanceHistory: MaintenanceRecord[];
  rating?: Rating;
  createdAt: Date;
  updatedAt: Date;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

interface MaintenanceRecord {
  id: string;
  date: Date;
  description: string;
  cost: number;
  technician: string;
}

interface Rating {
  score: number;
  comment: string;
  date: Date;
}

// Form validation schema
const serviceOrderFormSchema = z.object({
  clientId: z.string().min(1, { message: "Cliente é obrigatório" }),
  productId: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  technicalNotes: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

// Form values type
type ServiceOrderFormValues = z.infer<typeof serviceOrderFormSchema>;

interface ServiceOrderModalProps {
  serviceOrder?: ServiceOrder;
  onClose: () => void;
  onSave: (serviceOrder: Partial<ServiceOrder>) => void;
  open: boolean;
  isMutating?: boolean;
}

export function ServiceOrderModal({
  serviceOrder,
  onClose,
  onSave,
  open,
  isMutating,
}: ServiceOrderModalProps) {
  const t = useTranslations();
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(serviceOrderFormSchema),
    defaultValues: {
      clientId: serviceOrder?.clientId ?? serviceOrder?.client?.id ?? "",
      productId: serviceOrder?.productId ?? serviceOrder?.product?.id ?? "",
      status: serviceOrder?.status ?? "pending",
      description: serviceOrder?.description ?? "",
      technicalNotes: serviceOrder?.technicalNotes ?? "",
      scheduledDate: serviceOrder?.scheduledDate
        ? new Date(serviceOrder.scheduledDate).toISOString().split("T")[0]
        : "",
      scheduledTime: serviceOrder?.scheduledDate
        ? new Date(serviceOrder.scheduledDate)
            .toISOString()
            .split("T")[1]
            .slice(0, 5)
        : "",
    },
  });

  // Reset form values when service order changes
  useEffect(() => {
    if (open) {
      form.reset({
        clientId: serviceOrder?.clientId ?? serviceOrder?.client?.id ?? "",
        productId: serviceOrder?.productId ?? serviceOrder?.product?.id ?? "",
        status: serviceOrder?.status ?? "pending",
        description: serviceOrder?.description ?? "",
        technicalNotes: serviceOrder?.technicalNotes ?? "",
        scheduledDate: serviceOrder?.scheduledDate
          ? new Date(serviceOrder.scheduledDate).toISOString().split("T")[0]
          : "",
        scheduledTime: serviceOrder?.scheduledDate
          ? new Date(serviceOrder.scheduledDate)
              .toISOString()
              .split("T")[1]
              .slice(0, 5)
          : "",
      });
      setAttachments(serviceOrder?.attachments ?? []);
      setMaintenanceHistory(serviceOrder?.maintenanceHistory ?? []);
      setUploadingFiles([]);
    }
  }, [serviceOrder, open, form]);

  const [attachments, setAttachments] = useState<Attachment[]>(
    serviceOrder?.attachments ?? []
  );

  const [maintenanceHistory, setMaintenanceHistory] = useState<
    MaintenanceRecord[]
  >(serviceOrder?.maintenanceHistory ?? []);

  const [newMaintenance, setNewMaintenance] = useState({
    description: "",
    cost: 0,
    technician: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: uploadingInProgress } = useUploadThing(
    "documentUploader",
    {
      onClientUploadComplete: (res) => {
        if (res && res.length > 0) {
          const newAttachments: Attachment[] = res.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            url: file.url,
            type: file.type || "application/octet-stream",
            uploadedAt: new Date(),
          }));

          setAttachments((prev) => [...prev, ...newAttachments]);
          setIsUploading(false);
        }
      },
      onUploadError: (error) => {
        setError(error.message);
        toast({
          variant: "destructive",
          title: t("serviceOrders.uploadError") ?? "Upload Error",
          description: error.message,
        });
        setIsUploading(false);
      },
    }
  );

  // Form submission handler
  const onSubmit = async (data: ServiceOrderFormValues) => {
    setError(null);

    console.log(data);
    try {
      // Upload files if there are any
      if (uploadingFiles.length > 0) {
        setIsUploading(true);
        await startUpload(uploadingFiles);
        // The attachments will be updated in the onClientUploadComplete callback
        // We'll wait for the upload to complete before proceeding
        return;
      }

      const scheduledDateTime =
        data.scheduledDate && data.scheduledTime
          ? new Date(`${data.scheduledDate}T${data.scheduledTime}`)
          : undefined;

      // Prepare data for API with client ID instead of client object
      const serviceOrderData: Partial<ServiceOrder> = {
        clientId: data.clientId,
        productId: data.productId,
        status: data.status,
        description: data.description,
        technicalNotes: data.technicalNotes ?? "",
        scheduledDate: scheduledDateTime,
        attachments,
        maintenanceHistory,
        updatedAt: new Date(),
      };

      onSave(serviceOrderData);
      onClose();
    } catch (err) {
      console.error("Error saving service order:", err);
      setError(t("serviceOrders.errorSaving"));
    }
  };

  // Watch for upload completion and submit the form
  useEffect(() => {
    if (isUploading && !uploadingInProgress) {
      // Upload completed, now submit the form with the updated attachments
      const data = form.getValues();

      const scheduledDateTime =
        data.scheduledDate && data.scheduledTime
          ? new Date(`${data.scheduledDate}T${data.scheduledTime}`)
          : undefined;

      // Prepare data for API with client ID instead of client object
      const serviceOrderData: Partial<ServiceOrder> = {
        clientId: data.clientId,
        productId: data.productId,
        status: data.status,
        description: data.description,
        technicalNotes: data.technicalNotes ?? "",
        scheduledDate: scheduledDateTime,
        attachments,
        maintenanceHistory,
        updatedAt: new Date(),
      };

      onSave(serviceOrderData);
      onClose();
    }
  }, [
    isUploading,
    uploadingInProgress,
    form,
    attachments,
    maintenanceHistory,
    t,
    onSave,
    onClose,
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Store files for actual upload during submission
      setUploadingFiles((prev) => [...prev, ...Array.from(files)]);

      // Create temporary preview URLs for display
      const newAttachments: Attachment[] = [];

      for (const file of Array.from(files)) {
        if (file) {
          newAttachments.push({
            id: crypto.randomUUID(),
            name: file.name || "Unknown file",
            url: URL.createObjectURL(file),
            type: file.type || "application/octet-stream",
            uploadedAt: new Date(),
          });
        }
      }

      setAttachments((prev) => [...prev, ...newAttachments]);

      // Reset the input value to allow selecting the same file again
      if (e.target) {
        e.target.value = "";
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(t("serviceOrders.errorSaving"));
    }
  };

  const handleAddMaintenance = () => {
    if (newMaintenance.description && newMaintenance.technician) {
      const maintenance: MaintenanceRecord = {
        id: crypto.randomUUID(),
        date: new Date(),
        ...newMaintenance,
      };
      setMaintenanceHistory([...maintenanceHistory, maintenance]);
      setNewMaintenance({ description: "", cost: 0, technician: "" });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !open && onClose()}
      modal={true}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-full max-w-4xl bg-background max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {serviceOrder
              ? t("serviceOrders.editServiceOrder")
              : t("serviceOrders.newServiceOrder")}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("serviceOrders.form.client")}</FormLabel>
                    <FormControl>
                      <ClientSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("serviceOrders.form.clientPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("serviceOrders.form.product")}</FormLabel>
                    <FormControl>
                      <ProductSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("serviceOrders.form.productPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("serviceOrders.form.scheduledDate")}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("serviceOrders.form.scheduledTime")}
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("serviceOrders.form.status")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "serviceOrders.form.statusPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">
                          {t("serviceOrders.status.pending")}
                        </SelectItem>
                        <SelectItem value="in_progress">
                          {t("serviceOrders.status.inProgress")}
                        </SelectItem>
                        <SelectItem value="completed">
                          {t("serviceOrders.status.completed")}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {t("serviceOrders.status.cancelled")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("serviceOrders.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "serviceOrders.form.descriptionPlaceholder"
                      )}
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
              name="technicalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("serviceOrders.form.technicalNotes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "serviceOrders.form.technicalNotesPlaceholder"
                      )}
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("serviceOrders.form.attachments")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          {t("serviceOrders.form.clickToUpload")}
                        </span>{" "}
                        {t("serviceOrders.form.orDragAndDrop")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("serviceOrders.form.fileTypes")}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                attachment.uploadedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            {t("serviceOrders.form.viewAttachment")}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setAttachments(
                                attachments.filter(
                                  (a) => a.id !== attachment.id
                                )
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("serviceOrders.form.maintenanceHistory")}
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newMaintenance.description}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        description: e.target.value,
                      })
                    }
                    placeholder={t(
                      "serviceOrders.form.maintenanceForm.descriptionPlaceholder"
                    )}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={newMaintenance.cost}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        cost: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder={t(
                      "serviceOrders.form.maintenanceForm.costPlaceholder"
                    )}
                    step="0.01"
                    className="w-1/4"
                  />
                  <Input
                    type="text"
                    value={newMaintenance.technician}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        technician: e.target.value,
                      })
                    }
                    placeholder={t(
                      "serviceOrders.form.maintenanceForm.technicianPlaceholder"
                    )}
                    className="w-1/4"
                  />
                  <Button
                    type="button"
                    onClick={handleAddMaintenance}
                    disabled={
                      !newMaintenance.description.trim() ||
                      !newMaintenance.technician.trim()
                    }
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("serviceOrders.form.add")}
                  </Button>
                </div>
                {maintenanceHistory.length > 0 ? (
                  <div className="space-y-2">
                    {maintenanceHistory.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 bg-gray-50 rounded-lg relative"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              {record.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t(
                                "serviceOrders.form.maintenanceForm.technician"
                              )}
                              : {record.technician} -
                              {t("serviceOrders.form.maintenanceForm.cost")}: $
                              {record.cost.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setMaintenanceHistory(
                                maintenanceHistory.filter(
                                  (r) => r.id !== record.id
                                )
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {t("serviceOrders.form.noMaintenanceRecords")}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <div className="w-full flex justify-between">
                {!serviceOrder && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      form.reset();
                      setAttachments([]);
                      setMaintenanceHistory([]);
                      setUploadingFiles([]);
                    }}
                  >
                    {t("common.clear")}
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isMutating ?? isUploading ?? uploadingInProgress}
                  >
                    {(isUploading ?? uploadingInProgress)
                      ? (t("common.uploading") ?? "Uploading...")
                      : isMutating
                        ? t("common.saving")
                        : t("common.save")}
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
