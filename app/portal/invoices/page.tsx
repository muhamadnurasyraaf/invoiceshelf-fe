"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { portalService } from "@/lib/portal";
import { Invoice, InvoiceStatus, PaymentStatus } from "@/lib/invoices";
import { formatCurrency, formatDateLong } from "@/lib/format";

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await portalService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => formatDateLong(date);

  const statusColors: Record<InvoiceStatus, { bg: string; text: string }> = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-700" },
    SENT: { bg: "bg-blue-100", text: "text-blue-700" },
    VIEWED: { bg: "bg-purple-100", text: "text-purple-700" },
    COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
    REJECTED: { bg: "bg-red-100", text: "text-red-700" },
  };

  const paymentStatusColors: Record<
    PaymentStatus,
    { bg: string; text: string }
  > = {
    UNPAID: { bg: "bg-yellow-100", text: "text-yellow-700" },
    PARTIAL: { bg: "bg-orange-100", text: "text-orange-700" },
    PAID: { bg: "bg-green-100", text: "text-green-700" },
    OVERDUE: { bg: "bg-red-100", text: "text-red-700" },
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === "all") return true;
    if (filter === "unpaid")
      return ["UNPAID", "PARTIAL", "OVERDUE"].includes(invoice.paymentStatus);
    if (filter === "paid") return invoice.paymentStatus === "PAID";
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="all">All Invoices</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Due
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/portal/invoices/${invoice.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}
                        >
                          {invoice.status.charAt(0) +
                            invoice.status.slice(1).toLowerCase()}
                        </span>
                        <span
                          className={`inline-flex w-fit px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[invoice.paymentStatus].bg} ${paymentStatusColors[invoice.paymentStatus].text}`}
                        >
                          {invoice.paymentStatus.charAt(0) +
                            invoice.paymentStatus.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(invoice.amountDue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                      {formatCurrency(invoice.amountDue - invoice.amountPaid!)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/portal/invoices/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          View
                        </Link>
                        <a
                          href={portalService.getDownloadUrl(invoice.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
