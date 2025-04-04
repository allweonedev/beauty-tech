"use client";
import React, { useEffect } from "react";
import { Upload } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldErrors, useForm } from "react-hook-form";
import * as z from "zod";
import type { Product } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  type: z.enum(["equipment", "service"]),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  price: z.coerce
    .number()
    .min(0, { message: "Preço deve ser maior ou igual a zero" }),
  imageUrl: z.string().optional().nullable(),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
  application: z.string().min(1, { message: "Aplicação é obrigatória" }),
});

// Form values type
type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  open: boolean;
  isMutating?: boolean;
}

export function ProductModal({
  product,
  onClose,
  onSave,
  open,
  isMutating,
}: ProductModalProps) {
  const t = useTranslations();
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      type: product?.type ?? "equipment",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      imageUrl: product?.imageUrl ?? "",
      category: product?.category ?? "",
      application: product?.application ?? "",
    },
  });

  // Reset form values when product changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: product?.name ?? "",
        type: product?.type ?? "equipment",
        description: product?.description ?? "",
        price: product?.price ?? 0,
        imageUrl: product?.imageUrl ?? "",
        category: product?.category ?? "",
        application: product?.application ?? "",
      });
    }
  }, [product, open, form]);

  // Form submission handler
  const onSubmit = async (data: ProductFormValues) => {
    try {
      const productData: Partial<Product> = {
        ...data,
        imageUrl: data.imageUrl ?? undefined,
      };

      console.log(productData);
      onSave(productData);
      onClose();
    } catch (err) {
      console.error("Error saving product:", err);
      toast({
        variant: "destructive",
        title: t("products.errorSaving"),
        description: String(err),
      });
    }
  };

  // Form error handler
  const onError = (errors: FieldErrors<ProductFormValues>) => {
    // Get all error messages
    const errorMessages = Object.entries(errors)
      .map(([field, error]) => `${field}: ${error.message}`)
      .join(", ");

    toast({
      variant: "destructive",
      title: t("products.formValidationError") || "Form Validation Error",
      description:
        errorMessages || "Please fix the form errors before submitting",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      form.setValue("imageUrl", imageUrl);
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
        className="w-full max-w-3xl bg-background max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {product ? t("products.editProduct") : t("products.newProduct")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.type")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("products.form.typePlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="equipment">
                          {t("products.type.equipment")}
                        </SelectItem>
                        <SelectItem value="service">
                          {t("products.type.service")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.price")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          R$
                        </span>
                        <Input
                          type="number"
                          placeholder={t("products.form.pricePlaceholder")}
                          className="pl-10"
                          step="0.01"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.category")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.form.categoryPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="application"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.form.application")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.form.applicationPlaceholder")}
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
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("products.form.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("products.form.descriptionPlaceholder")}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("products.form.image")}</FormLabel>
                  <div className="flex items-center space-x-4">
                    {field.value && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={field.value}
                        alt={form.getValues().name}
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    )}
                    <div
                      className="flex flex-col items-center justify-center h-32 w-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        document.getElementById("imageUpload")?.click();
                      }}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-xs text-gray-500 mt-2">
                          {t("products.form.uploadImage")}
                        </p>
                      </div>
                      <Input
                        id="imageUpload"
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <div className="w-full flex justify-between">
                {!product && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      form.reset();
                    }}
                  >
                    {t("common.clear")}
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={isMutating}>
                    {isMutating ? t("common.saving") : t("common.save")}
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
