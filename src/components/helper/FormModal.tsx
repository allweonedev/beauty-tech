"use client";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { type z } from "zod";
import {
  useForm,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { type UseMutationResult } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useUploadThing } from "@/hooks/useUploadthing";

type FormActionType = "create" | "update";

interface ReusableFormModalProps<
  TFormSchema extends z.ZodType,
  TFormValues extends FieldValues = z.infer<TFormSchema>,
  TData = unknown,
  TError = Error,
  TContext = unknown,
> {
  // Modal props
  open: boolean;
  onClose: () => void;
  title: string;

  // Form props
  schema: TFormSchema;
  defaultValues?: DefaultValues<TFormValues>;
  initialData?: Partial<TFormValues> & { id?: string };

  // Action props
  actionType: FormActionType;

  // Hook function references
  useCreateHook: () => UseMutationResult<
    TData,
    TError,
    TFormValues, // Create param type
    TContext
  >;
  useUpdateHook: () => UseMutationResult<
    TData,
    TError,
    { id: string; data: TFormValues }, // Update param type
    TContext
  >;

  // Handler for preparing data before submission
  transformData?: (data: TFormValues) => TFormValues;

  // Upload config (optional)
  hasFileUploads?: boolean;

  // UI customization
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  confirmLabel?: string;
  cancelLabel?: string;

  // Children render function
  children: (form: UseFormReturn<TFormValues>) => React.ReactNode;

  // Optional callbacks
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

export default function ReusableFormModal<
  TFormSchema extends z.ZodType,
  TFormValues extends FieldValues = z.infer<TFormSchema>,
  TData = unknown,
  TError = Error,
  TContext = unknown,
>({
  open,
  onClose,
  title,
  schema,
  defaultValues,
  initialData,
  actionType,
  useCreateHook,
  useUpdateHook,
  transformData = (data) => data,
  hasFileUploads = false,
  maxWidth = "3xl",
  confirmLabel,
  cancelLabel,
  children,
  onSuccess,
  onError,
}: ReusableFormModalProps<TFormSchema, TFormValues, TData, TError, TContext>) {
  const t = useTranslations();
  const { toast } = useToast();

  // Call the hooks to get the mutations
  const createMutation = useCreateHook();
  const updateMutation = useUpdateHook();

  // Determine which mutation to use
  const currentMutation =
    actionType === "create" ? createMutation : updateMutation;

  // Configure form with zod validation
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? ({} as DefaultValues<TFormValues>),
  });

  // For file uploads
  const { startUpload, isUploading } = useUploadThing("imageUploader");

  // Reset form when initialData changes
  useEffect(() => {
    if (open && initialData) {
      form.reset({
        ...defaultValues,
        ...initialData,
      } as DefaultValues<TFormValues>);
    }
  }, [open, initialData, form, defaultValues]);

  // Clear form on close
  const handleClose = () => {
    form.reset(defaultValues as DefaultValues<TFormValues>);
    onClose();
  };

  const onSubmit: SubmitHandler<TFormValues> = async (data) => {
    try {
      // Create a mutable copy of the data to allow modifications
      let processedData = { ...data };

      // Handle file uploads if needed
      if (hasFileUploads && startUpload) {
        // Find file fields in the data and upload them
        const fileData = Object.entries(data).reduce(
          (acc, [key, value]) => {
            if (
              value instanceof File ||
              (Array.isArray(value) && value[0] instanceof File)
            ) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, File | File[]>
        );

        if (Object.keys(fileData).length > 0) {
          const files = Object.values(fileData)
            .flat()
            .filter((file): file is File => file instanceof File);

          if (files.length > 0) {
            const uploadResults = await startUpload(files);

            // Update the data with the uploaded file URLs
            if (uploadResults) {
              Object.keys(fileData).forEach((key) => {
                const currentValue = fileData[key];

                if (currentValue instanceof File) {
                  const uploadResult = uploadResults.find(
                    (_r) => files.indexOf(currentValue) !== -1
                  );
                  if (uploadResult) {
                    processedData = {
                      ...processedData,
                      [key]: uploadResult.url,
                    };
                  }
                } else if (Array.isArray(currentValue)) {
                  // Handle arrays of files
                  const fileUrls = currentValue
                    .filter((f): f is File => f instanceof File)
                    .map((file) => {
                      const uploadResult = uploadResults.find(
                        (_r) => files.indexOf(file) !== -1
                      );
                      return uploadResult ? uploadResult.ufsUrl : "";
                    })
                    .filter(Boolean);

                  processedData = {
                    ...processedData,
                    [key]: fileUrls,
                  };
                }
              });
            }
          }
        }
      }

      // Transform the data before submission
      const finalData = transformData(processedData);

      // Execute the mutation
      if (actionType === "create") {
        await createMutation.mutateAsync(finalData, {
          onSuccess: (data) => {
            toast({
              title: t("common.created"),
              description: t("common.createSuccess"),
            });

            if (onSuccess) onSuccess(data);
            handleClose();
          },
          onError: (error) => {
            toast({
              title: t("common.error"),
              description:
                error instanceof Error ? error.message : String(error),
              variant: "destructive",
            });

            if (onError) onError(error);
          },
        });
      } else {
        // For update we need to include the ID
        await updateMutation.mutateAsync(
          {
            id: initialData!.id!,
            data: finalData,
          },
          {
            onSuccess: (data) => {
              toast({
                title: t("common.updated"),
                description: t("common.updateSuccess"),
              });

              if (onSuccess) onSuccess(data);
              handleClose();
            },
            onError: (error) => {
              toast({
                title: t("common.error"),
                description:
                  error instanceof Error ? error.message : String(error),
                variant: "destructive",
              });

              if (onError) onError(error);
            },
          }
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

  const isBusy = currentMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={`w-full max-w-${maxWidth} bg-background max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {children(form)}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isBusy}
              >
                {cancelLabel ?? t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isBusy
                  ? t("common.saving")
                  : (confirmLabel ??
                    (actionType === "create"
                      ? t("common.create")
                      : t("common.update")))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
