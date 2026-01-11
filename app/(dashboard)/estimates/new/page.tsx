"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { estimateService } from "@/lib/estimates";
import { customerService, Customer } from "@/lib/customers";
import { itemService, Item } from "@/lib/items";

const estimateItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const estimateSchema = z.object({
  number: z.string().min(1, "Estimate number is required"),
  customerId: z.string().min(1, "Customer is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  notes: z.string().optional(),
  items: z.array(estimateItemSchema).min(1, "At least one item is required"),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

export default function NewEstimatePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      number: `EST-${Date.now().toString().slice(-6)}`,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: [{ itemId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsDataLoading(true);
      const [customersData, itemsData] = await Promise.all([
        customerService.getAll(),
        itemService.getAll(),
      ]);
      setCustomers(customersData);
      setItems(itemsData);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsDataLoading(false);
    }
  };

  const calculateTotal = () => {
    return watchItems.reduce((total, watchItem) => {
      const item = items.find((i) => i.id === watchItem.itemId);
      return total + (item?.price || 0) * (watchItem.quantity || 0);
    }, 0);
  };

  const onSubmit = async (data: EstimateFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await estimateService.create(data);
      router.push("/estimates");
    } catch {
      setError("Failed to create estimate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
          <Link href="/estimates" className="hover:text-indigo-600">
            Estimates
          </Link>
          <span>/</span>
          <span>New Estimate</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">New Estimate</h1>
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
            {/* Estimate Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("number")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="EST-001"
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

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("expiryDate")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.expiryDate.message}
                </p>
              )}
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
                      (i) => i.id === watchItems[index]?.itemId
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
              <p className="mt-1 text-sm text-red-500">{errors.items.message}</p>
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
              {isLoading ? "Creating..." : "Create Estimate"}
            </button>
            <Link
              href="/estimates"
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
