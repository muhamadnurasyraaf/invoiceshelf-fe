"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { invoiceService } from "@/lib/invoices";
import { customerService, Customer } from "@/lib/customers";
import { itemService, Item } from "@/lib/items";
import { taxService, Tax } from "@/lib/taxes";
import { formatCurrency } from "@/lib/format";
import { ProcessedInvoiceData } from "@/lib/ocr";

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

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOcr = searchParams.get("fromOcr") === "true";

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [ocrData, setOcrData] = useState<ProcessedInvoiceData | null>(null);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      number: `INV-${Date.now().toString().slice(-6)}`,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: [{ itemId: "", quantity: 1 }],
      taxId: "",
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchTaxId = watch("taxId");

  // Load OCR data from sessionStorage first (before loading other data)
  useEffect(() => {
    if (fromOcr) {
      const storedOcrData = sessionStorage.getItem("ocrInvoiceData");
      if (storedOcrData) {
        try {
          const parsed = JSON.parse(storedOcrData) as ProcessedInvoiceData;
          setOcrData(parsed);
          sessionStorage.removeItem("ocrInvoiceData");
        } catch (e) {
          console.error("Failed to parse OCR data:", e);
        }
      }
    }
  }, [fromOcr]);

  // Load data (customers, items, taxes) - this will include any newly created from OCR
  useEffect(() => {
    loadData();
  }, []);

  // Apply OCR data to form when both OCR data and reference data are loaded
  useEffect(() => {
    if (ocrData && !isDataLoading && items.length > 0) {
      applyOcrDataToForm(ocrData);
    }
  }, [ocrData, isDataLoading, items]);

  const applyOcrDataToForm = (data: ProcessedInvoiceData) => {
    const notices: string[] = [];

    // Set invoice number if available
    if (data.invoiceNumber) {
      setValue("number", data.invoiceNumber);
    }

    // Set due date if available
    if (data.dueDate) {
      setValue("dueDate", data.dueDate);
    }

    // Set notes if available
    if (data.notes) {
      setValue("notes", data.notes);
    }

    // Use processed customer ID directly if available
    if (data.customer) {
      setValue("customerId", data.customer.id);
      if (data.customer.isNew) {
        notices.push(
          `New customer "${data.customer.companyName}" was automatically created.`,
        );
      }
    } else if (data.customerName || data.customerEmail) {
      // Fallback: customer data was extracted but couldn't be created (missing required fields)
      notices.push(
        `Customer "${data.customerName || data.customerEmail}" could not be created (missing required fields). Please select manually or create a new customer.`,
      );
    }

    // Try to match tax rate
    if (data.taxRate) {
      const matchedTax = taxes.find((t) => t.rate === data.taxRate);
      if (matchedTax) {
        setValue("taxId", matchedTax.id);
      } else {
        notices.push(
          `Tax rate of ${data.taxRate}% not found. Please create this tax rate or select manually.`,
        );
      }
    }

    // Use processed items directly if available
    if (data.processedItems && data.processedItems.length > 0) {
      const formItems = data.processedItems.map((processedItem) => ({
        itemId: processedItem.itemId,
        quantity: processedItem.quantity || 1,
      }));

      replace(formItems);

      const newItems = data.processedItems.filter((item) => item.isNew);
      if (newItems.length > 0) {
        notices.push(
          `${newItems.length} new item(s) were automatically created: ${newItems.map((i) => i.name).join(", ")}.`,
        );
      }
    }

    if (notices.length > 0) {
      setOcrNotice(notices.join(" | "));
    }
  };

  const loadData = async () => {
    try {
      setIsDataLoading(true);
      const [customersData, itemsData, taxesData] = await Promise.all([
        customerService.getAll(),
        itemService.getAll(),
        taxService.getAll(),
      ]);
      setCustomers(customersData);
      setItems(itemsData);
      setTaxes(taxesData);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsDataLoading(false);
    }
  };

  const calculateSubTotal = () => {
    return watchItems.reduce((total, watchItem) => {
      const item = items.find((i) => i.id === watchItem.itemId);
      return total + (item?.price || 0) * (watchItem.quantity || 0);
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
    setIsLoading(true);
    setError(null);
    try {
      const submitData = {
        ...data,
        taxId: data.taxId || undefined,
      };
      await invoiceService.create(submitData);
      router.push("/invoices");
    } catch {
      setError("Failed to create invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          <span>New Invoice</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">New Invoice</h1>
        {fromOcr && (
          <p className="text-sm text-purple-600 mt-1">
            Pre-filled from scanned invoice image
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {ocrNotice && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-medium">OCR Notice</p>
              <p className="text-sm mt-1">{ocrNotice}</p>
            </div>
          </div>
          <button
            onClick={() => setOcrNotice(null)}
            className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* OCR Extracted Data Summary */}
      {fromOcr && ocrData && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-purple-900 mb-2">
            Scanned Invoice Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {ocrData.vendorName && (
              <div>
                <span className="text-purple-600">Vendor:</span>{" "}
                <span className="text-purple-900">{ocrData.vendorName}</span>
              </div>
            )}
            {ocrData.customerName && (
              <div>
                <span className="text-purple-600">Customer:</span>{" "}
                <span className="text-purple-900">{ocrData.customerName}</span>
              </div>
            )}
            {ocrData.total !== undefined && (
              <div>
                <span className="text-purple-600">Total:</span>{" "}
                <span className="text-purple-900">
                  {formatCurrency(ocrData.total)}
                </span>
              </div>
            )}
            {ocrData.items && (
              <div>
                <span className="text-purple-600">Items:</span>{" "}
                <span className="text-purple-900">
                  {ocrData.items.length} line item(s)
                </span>
              </div>
            )}
          </div>
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
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Invoice"}
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
