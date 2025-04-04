"use client";
import React, { useState, useEffect } from "react";
import { Upload, Plus } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Client, ClientDocument, ClientNote } from "@/types/client";
import { useUploadThing } from "@/hooks/useUploadthing";

// Form validation schema
const clientFormSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }).optional().nullable(),
  phone: z.string().min(1, { message: "Telefone é obrigatório" }),
  cpf: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().optional(),
});

// Form values type
type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientModalProps {
  client?: Client;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
  open: boolean;
  isMutating?: boolean;
}

export function ClientModal({
  client,
  onClose,
  onSave,
  open,
  isMutating,
}: ClientModalProps) {
  const t = useTranslations();

  // Initialize form with default values
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      cpf: client?.cpf ?? "",
      address: client?.address ?? "",
      birthDate: client?.birthDate
        ? new Date(client.birthDate).toISOString().split("T")[0]
        : "",
    },
  });

  // Reset form values when client changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: client?.name ?? "",
        email: client?.email ?? "",
        phone: client?.phone ?? "",
        cpf: client?.cpf ?? "",
        address: client?.address ?? "",
        birthDate: client?.birthDate
          ? new Date(client.birthDate).toISOString().split("T")[0]
          : "",
      });
      setDocuments(client?.documents ?? []);
      setNotes(client?.notes ?? []);
      setUploadingFiles([]);
    }
  }, [client, open, form]);

  const [documents, setDocuments] = useState<ClientDocument[]>(
    client?.documents ?? []
  );
  const [notes, setNotes] = useState<ClientNote[]>(client?.notes ?? []);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: uploadingInProgress } = useUploadThing(
    "documentUploader",
    {
      onClientUploadComplete: (res) => {
        if (res && res.length > 0) {
          const newDocuments: ClientDocument[] = res.map((file) => ({
            id: crypto.randomUUID(),
            clientId: client?.id ?? "",
            name: file.name,
            url: file.url,
            uploadedAt: new Date(),
          }));

          setDocuments((prev) => [...prev, ...newDocuments]);
          setIsUploading(false);
        }
      },
      onUploadError: (error) => {
        setError(error.message);
        setIsUploading(false);
      },
    }
  );

  // Form submission handler
  const onSubmit = async (data: ClientFormValues) => {
    setError(null);

    try {
      // Upload files if there are any
      if (uploadingFiles.length > 0) {
        setIsUploading(true);
        await startUpload(uploadingFiles);
        // The documents will be updated in the onClientUploadComplete callback
        // We'll wait for the upload to complete before proceeding
        return;
      }

      const clientData: Partial<Client> = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        documents,
        notes,
        interactions: client?.interactions ?? [],
        source: client?.source ?? "manual",
      };

      onSave(clientData);
      onClose();
    } catch (err) {
      console.error("Error saving client:", err);
      setError(t("clients.errorSaving"));
    }
  };

  // Watch for upload completion and submit the form
  useEffect(() => {
    if (isUploading && !uploadingInProgress) {
      // Upload completed, now submit the form
      const data = form.getValues();
      const clientData: Partial<Client> = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        documents,
        notes,
        interactions: client?.interactions ?? [],
        source: client?.source ?? "manual",
      };

      onSave(clientData);
      onClose();
    }
  }, [
    isUploading,
    uploadingInProgress,
    form,
    documents,
    notes,
    client,
    onSave,
    onClose,
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Store files for actual upload during submission
      setUploadingFiles((prev) => [...prev, ...Array.from(files)]);

      // Create temporary preview URLs
      const newDocuments: ClientDocument[] = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        clientId: client?.id ?? "",
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
      }));

      setDocuments([...documents, ...newDocuments]);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: ClientNote = {
        id: crypto.randomUUID(),
        clientId: client?.id ?? "",
        content: newNote,
        createdAt: new Date(),
      };
      setNotes([...notes, note]);
      setNewNote("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-full max-w-4xl bg-background max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {client ? t("clients.editClient") : t("clients.newClient")}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.form.fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("clients.form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.form.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("clients.form.emailPlaceholder")}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.form.phone")}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={t("clients.form.phonePlaceholder")}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.form.cpf")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("clients.form.cpfPlaceholder")}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.form.address")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("clients.form.addressPlaceholder")}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clients.form.birthDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-input pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("clients.form.documents.title")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2  rounded-lg cursor-pointer border-input hover:bg-accent">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          {t("clients.form.documents.clickToUpload")}
                        </span>{" "}
                        {t("clients.form.documents.orDragAndDrop")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("clients.form.documents.fileTypes")}
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
                {documents.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t("clients.form.documents.view")}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("clients.form.notes.title")}
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={t("clients.form.notes.addNotePlaceholder")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("clients.form.notes.add")}
                  </Button>
                </div>
                {notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-gray-50 rounded-lg relative"
                      >
                        <p className="text-sm text-gray-900">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {t("clients.form.notes.noNotes")}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <div className="w-full flex justify-between">
                {!client && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      form.reset();
                      setDocuments([]);
                      setNotes([]);
                      setNewNote("");
                      setError("");
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
