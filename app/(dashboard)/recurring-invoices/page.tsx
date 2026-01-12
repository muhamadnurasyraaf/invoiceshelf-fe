"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  recurringInvoiceService,
  RecurringInvoice,
  RecurringInvoiceStatus,
  RecurringFrequency,
} from "@/lib/recurring-invoices";
import { formatCurrency, formatDateLong } from "@/lib/format";

const statusColors: Record<
  RecurringInvoiceStatus,
  { bg: string; text: string }
> = {
  ACTIVE: { bg: "bg-green-100", text: "text-green-700" },
  PAUSED: { bg: "bg-yellow-100", text: "text-yellow-700" },
  COMPLETED: { bg: "bg-gray-100", text: "text-gray-700" },
};

const frequencyLabels: Record<RecurringFrequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export default function RecurringInvoicesPage() {
  const [recurringInvoices, setRecurringInvoices] = useState<
    RecurringInvoice[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecurringInvoices();
  }, []);

  const loadRecurringInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await recurringInvoiceService.getAll();
      setRecurringInvoices(data);
    } catch {
      setError("Failed to load recurring invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring invoice?"))
      return;

    try {
      await recurringInvoiceService.delete(id);
      setRecurringInvoices(recurringInvoices.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete recurring invoice");
    }
  };

  const handleStatusChange = async (
    id: string,
    status: RecurringInvoiceStatus,
  ) => {
    try {
      const updated = await recurringInvoiceService.updateStatus(id, status);
      setRecurringInvoices(
        recurringInvoices.map((r) => (r.id === id ? updated : r)),
      );
    } catch {
      setError("Failed to update status");
    }
  };

  const handleTriggerGeneration = async () => {
    try {
      await recurringInvoiceService.triggerGeneration();
      alert("Invoice generation triggered successfully!");
      loadRecurringInvoices();
    } catch {
      setError("Failed to trigger invoice generation");
    }
  };

  const formatDate = (dateString: string) => formatDateLong(dateString);

  const calculateEstimatedAmount = (invoice: RecurringInvoice) => {
    return invoice.items.reduce(
      (total, item) => total + item.item.price * item.quantity,
      0,
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Recurring Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Automate your billing with recurring invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerGeneration}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Generate Now
          </button>
          <Link
            href="/recurring-invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Recurring Invoice
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Invoice
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recurringInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      No recurring invoices yet
                    </p>
                    <Link
                      href="/recurring-invoices/new"
                      className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Create your first recurring invoice
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              recurringInvoices.map((recurring) => (
                <tr key={recurring.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {recurring.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {recurring.generatedCount} invoices generated
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {recurring.customer?.companyName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {recurring.customer?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {frequencyLabels[recurring.frequency]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={recurring.status}
                      onChange={(e) =>
                        handleStatusChange(
                          recurring.id,
                          e.target.value as RecurringInvoiceStatus,
                        )
                      }
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[recurring.status].bg} ${statusColors[recurring.status].text}`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(calculateEstimatedAmount(recurring))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(recurring.nextInvoiceDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/recurring-invoices/${recurring.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(recurring.id)}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
