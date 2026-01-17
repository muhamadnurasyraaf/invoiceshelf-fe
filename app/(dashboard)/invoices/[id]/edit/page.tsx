"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  invoiceService,
  Invoice,
  InvoiceStatus,
  PaymentStatus,
} from "@/lib/invoices";
import { customerService, Customer } from "@/lib/customers";
import { itemService, Item } from "@/lib/items";
import { taxService, Tax } from "@/lib/taxes";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ui/toast";

const invoiceItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const invoiceSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  customerId: z.string().min(1, "Customer is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  taxId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const statusColors: Record<InvoiceStatus, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-700" },
  SENT: { bg: "bg-blue-100", text: "text-blue-700" },
  VIEWED: { bg: "bg-purple-100", text: "text-purple-700" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700" },
};

const paymentStatusColors: Record<PaymentStatus, { bg: string; text: string }> =
  {
    UNPAID: { bg: "bg-yellow-100", text: "text-yellow-700" },
    PARTIAL: { bg: "bg-orange-100", text: "text-orange-700" },
    PAID: { bg: "bg-green-100", text: "text-green-700" },
    OVERDUE: { bg: "bg-red-100", text: "text-red-700" },
  };

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { showToast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items") || [];
  const watchTaxId = watch("taxId");

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoiceData, customersData, itemsData, taxesData] =
        await Promise.all([
          invoiceService.getById(invoiceId),
          customerService.getAll(),
          itemService.getAll(),
          taxService.getAll(),
        ]);

      setInvoice(invoiceData);
      setCustomers(customersData);
      setItems(itemsData);
      setTaxes(taxesData);

      reset({
        number: invoiceData.number,
        customerId: invoiceData.customerId,
        dueDate: new Date(invoiceData.dueDate).toISOString().split("T")[0],
        notes: invoiceData.notes || "",
        taxId: invoiceData.taxId || "",
        items: invoiceData.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
      });
    } catch {
      setError("Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubTotal = () => {
    return watchItems.reduce((total, watchItem) => {
      const item = items.find((i) => i.id === watchItem?.itemId);
      return total + (item?.price || 0) * (watchItem?.quantity || 0);
    }, 0);
  };

  const calculateTaxAmount = () => {
    if (!watchTaxId) return 0;
    const tax = taxes.find((t) => t.id === watchTaxId);
    if (!tax) return 0;
    return (calculateSubTotal() * tax.rate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateTaxAmount();
  };

  const getSelectedTax = () => {
    if (!watchTaxId) return null;
    return taxes.find((t) => t.id === watchTaxId);
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSaving(true);
    setError(null);
    try {
      const submitData = {
        ...data,
        taxId: data.taxId || null,
      };
      await invoiceService.update(invoiceId, submitData);
      showToast("Invoice updated successfully", "success");
      router.push("/invoices");
    } catch {
      setError("Failed to update invoice. Please try again.");
      showToast("Failed to update invoice", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!invoice && !isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Invoice not found
        </h2>
        <p className="text-gray-500 mb-4">
          The invoice you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/invoices"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/invoices" className="hover:text-indigo-600">
            Invoices
          </Link>
          <span>/</span>
          <span>{invoice?.number}</span>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Invoice</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("number")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="INV-001"
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.number.message}
                </p>
              )}
            </div>

            {/* Status (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2 items-center py-2.5">
                {invoice && (
                  <>
                    <span
                      className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}
                    >
                      {invoice.status.charAt(0) +
                        invoice.status.slice(1).toLowerCase()}
                    </span>
                    <span
                      className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${paymentStatusColors[invoice.paymentStatus].bg} ${paymentStatusColors[invoice.paymentStatus].text}`}
                    >
                      {invoice.paymentStatus.charAt(0) +
                        invoice.paymentStatus.slice(1).toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                {...register("customerId")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* Tax Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax (Optional)
              </label>
              <select
                {...register("taxId")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
              >
                <option value="">No Tax</option>
                {taxes.map((tax) => (
                  <option key={tax.id} value={tax.id}>
                    {tax.name} ({tax.rate}%)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select a tax rate to apply to this invoice
              </p>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => append({ itemId: "", quantity: 1 })}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                      Total
                    </th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fields.map((field, index) => {
                    const selectedItem = items.find(
                      (i) => i.id === watchItems[index]?.itemId,
                    );
                    const lineTotal =
                      (selectedItem?.price || 0) *
                      (watchItems[index]?.quantity || 0);

                    return (
                      <tr key={field.id}>
                        <td className="px-4 py-3">
                          <select
                            {...register(`items.${index}.itemId`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 text-sm"
                          >
                            <option value="">Select item</option>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({formatCurrency(item.price)})
                              </option>
                            ))}
                          </select>
                          {errors.items?.[index]?.itemId && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.items[index]?.itemId?.message}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {selectedItem
                            ? formatCurrency(selectedItem.price)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-4 py-3">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-sm text-gray-600"
                    >
                      Subtotal:
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {formatCurrency(calculateSubTotal())}
                    </td>
                    <td></td>
                  </tr>
                  {getSelectedTax() && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right text-sm text-gray-600"
                      >
                        Tax ({getSelectedTax()?.name} - {getSelectedTax()?.rate}
                        %):
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {formatCurrency(calculateTaxAmount())}
                      </td>
                      <td></td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right text-sm font-medium text-gray-700"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {formatCurrency(calculateTotal())}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {errors.items && !Array.isArray(errors.items) && (
              <p className="mt-1 text-sm text-red-500">
                {errors.items.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
              placeholder="Additional notes for the client..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/invoices"
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
