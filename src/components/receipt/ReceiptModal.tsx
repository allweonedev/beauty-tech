import React, { useState, useEffect } from "react";
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
import type { Receipt, ReceiptItem } from "@/types/receipt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ClientSelect } from "@/components/selects/ClientSelect";

// Form validation schema
const receiptFormSchema = z.object({
  clientId: z.string().min(1, { message: "Client is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  dueDate: z.string().optional(),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  notes: z.string().optional(),
  subtotal: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().nonnegative().optional(),
  discount: z.coerce.number().nonnegative().optional(),
  total: z.coerce.number().nonnegative().optional(),
});

// Form values type
type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

// Item validation schema
const receiptItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.coerce
    .number()
    .positive({ message: "Quantity must be positive" }),
  unitPrice: z.coerce
    .number()
    .nonnegative({ message: "Price must be non-negative" }),
  amount: z.coerce.number().nonnegative().optional(),
  serviceDate: z.string().optional(),
  productId: z.string().optional(),
});

type ReceiptItemFormValues = z.infer<typeof receiptItemSchema>;

interface ReceiptModalProps {
  receipt?: Receipt;
  onClose: () => void;
  onSave: (receipt: Partial<Receipt>) => void;
  open: boolean;
  isMutating?: boolean;
}

export function ReceiptModal({
  receipt,
  onClose,
  onSave,
  open,
  isMutating,
}: ReceiptModalProps) {
  const t = useTranslations();

  // Initialize form with default values
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      clientId: receipt?.clientId ?? "",
      date: receipt?.date
        ? format(new Date(receipt.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      dueDate: receipt?.dueDate
        ? format(new Date(receipt.dueDate), "yyyy-MM-dd")
        : "",
      paymentMethod: receipt?.paymentMethod ?? "cash",
      status: receipt?.status ?? "draft",
      notes: receipt?.notes ?? "",
      subtotal: receipt?.subtotal ?? 0,
      tax: receipt?.tax ?? 0,
      discount: receipt?.discount ?? 0,
      total: receipt?.total ?? 0,
    },
  });

  // Item form
  const itemForm = useForm<ReceiptItemFormValues>({
    resolver: zodResolver(receiptItemSchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      serviceDate: format(new Date(), "yyyy-MM-dd"),
      productId: "",
    },
  });

  // State for items
  const [items, setItems] = useState<ReceiptItem[]>(receipt?.items ?? []);
  const [error, setError] = useState<string | null>(null);

  // Reset form values when receipt changes
  useEffect(() => {
    if (open) {
      form.reset({
        clientId: receipt?.clientId ?? "",
        date: receipt?.date
          ? format(new Date(receipt.date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        dueDate: receipt?.dueDate
          ? format(new Date(receipt.dueDate), "yyyy-MM-dd")
          : "",
        paymentMethod: receipt?.paymentMethod ?? "cash",
        status: receipt?.status ?? "draft",
        notes: receipt?.notes ?? "",
        subtotal: receipt?.subtotal ?? 0,
        tax: receipt?.tax ?? 0,
        discount: receipt?.discount ?? 0,
        total: receipt?.total ?? 0,
      });
      setItems(receipt?.items ?? []);
    }
  }, [receipt, open, form]);

  // Calculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = form.getValues("tax") ?? 0;
    const discount = form.getValues("discount") ?? 0;
    const total = subtotal + tax - discount;

    form.setValue("subtotal", subtotal);
    form.setValue("total", total);
  }, [items, form]);

  // Add item
  const handleAddItem = (data: ReceiptItemFormValues) => {
    const newItem: ReceiptItem = {
      id: crypto.randomUUID(),
      receiptId: receipt?.id ?? "",
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      amount: data.amount ?? data.quantity * data.unitPrice,
      serviceDate: data.serviceDate ? new Date(data.serviceDate) : null,
      productId: data.productId ?? null,
    };

    setItems([...items, newItem]);

    // Reset the item form
    itemForm.reset({
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      serviceDate: format(new Date(), "yyyy-MM-dd"),
      productId: "",
    });
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Form submission handler
  const onSubmit = async (data: ReceiptFormValues) => {
    setError(null);

    try {
      if (items.length === 0) {
        setError("At least one item is required");
        return;
      }

      const receiptData: Partial<Receipt> = {
        ...data,
        date: new Date(data.date),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        items,
        paymentMethod: data.paymentMethod as Receipt["paymentMethod"],
        status: data.status as Receipt["status"],
      };

      onSave(receiptData);
      onClose();
    } catch (err) {
      console.error("Error saving receipt:", err);
      setError(t("receipts.errorSaving"));
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
            {receipt ? t("receipts.editReceipt") : t("receipts.newReceipt")}
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
                    <FormLabel>{t("receipts.form.client")}</FormLabel>
                    <FormControl>
                      <ClientSelect
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isMutating}
                        placeholder={t("receipts.form.selectClient")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("receipts.form.date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("receipts.form.dueDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("receipts.form.paymentMethod")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isMutating}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("receipts.form.selectPaymentMethod")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">
                          {t("receipts.paymentMethods.cash")}
                        </SelectItem>
                        <SelectItem value="credit_card">
                          {t("receipts.paymentMethods.credit_card")}
                        </SelectItem>
                        <SelectItem value="debit_card">
                          {t("receipts.paymentMethods.debit_card")}
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          {t("receipts.paymentMethods.bank_transfer")}
                        </SelectItem>
                        <SelectItem value="pix">
                          {t("receipts.paymentMethods.pix")}
                        </SelectItem>
                        <SelectItem value="installment">
                          {t("receipts.paymentMethods.installment")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("receipts.form.status")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isMutating}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("receipts.form.selectStatus")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">
                          {t("receipts.status.draft")}
                        </SelectItem>
                        <SelectItem value="issued">
                          {t("receipts.status.issued")}
                        </SelectItem>
                        <SelectItem value="paid">
                          {t("receipts.status.paid")}
                        </SelectItem>
                        <SelectItem value="overdue">
                          {t("receipts.status.overdue")}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {t("receipts.status.cancelled")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">
                {t("receipts.form.items.title")}
              </h3>

              {/* Item list */}
              {items.length > 0 && (
                <div className="mb-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("receipts.form.items.description")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("receipts.form.items.quantity")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("receipts.form.items.unitPrice")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("receipts.form.items.amount")}
                        </TableHead>
                        <TableHead>
                          {t("receipts.form.items.serviceDate")}
                        </TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.amount)}
                          </TableCell>
                          <TableCell>
                            {item.serviceDate
                              ? format(new Date(item.serviceDate), "dd/MM/yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Add item form */}
              <Form {...itemForm}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={itemForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("receipts.form.items.description")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "receipts.form.items.descriptionPlaceholder"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={itemForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("receipts.form.items.quantity")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const quantity =
                                  parseFloat(e.target.value) || 0;
                                const unitPrice =
                                  itemForm.getValues("unitPrice") || 0;
                                itemForm.setValue(
                                  "amount",
                                  quantity * unitPrice
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={itemForm.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("receipts.form.items.unitPrice")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const unitPrice =
                                  parseFloat(e.target.value) || 0;
                                const quantity =
                                  itemForm.getValues("quantity") || 0;
                                itemForm.setValue(
                                  "amount",
                                  quantity * unitPrice
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={itemForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("receipts.form.items.amount")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={itemForm.control}
                      name="serviceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("receipts.form.items.serviceDate")}
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={itemForm.handleSubmit(handleAddItem)}
                  className="mb-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("receipts.form.items.add")}
                </Button>
              </Form>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div></div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t("receipts.form.subtotal")}:
                    </span>
                    <span className="text-sm">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "BRL",
                      }).format(form.getValues("subtotal") ?? 0)}
                    </span>
                  </div>

                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center gap-4">
                          <FormLabel className="m-0">
                            {t("receipts.form.tax")}:
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-32 text-right"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const tax = parseFloat(e.target.value) ?? 0;
                                const subtotal =
                                  form.getValues("subtotal") ?? 0;
                                const discount =
                                  form.getValues("discount") ?? 0;
                                form.setValue(
                                  "total",
                                  subtotal + tax - discount
                                );
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center gap-4">
                          <FormLabel className="m-0">
                            {t("receipts.form.discount")}:
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-32 text-right"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const discount =
                                  parseFloat(e.target.value) ?? 0;
                                const subtotal =
                                  form.getValues("subtotal") ?? 0;
                                const tax = form.getValues("tax") ?? 0;
                                form.setValue(
                                  "total",
                                  subtotal + tax - discount
                                );
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-lg font-bold">
                      {t("receipts.form.total")}:
                    </span>
                    <span className="text-lg font-bold">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "BRL",
                      }).format(form.getValues("total") ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="border-t border-gray-200 pt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("receipts.form.notes")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("receipts.form.notesPlaceholder")}
                        className="min-h-20"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <div className="w-full flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isMutating}>
                  {isMutating ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
