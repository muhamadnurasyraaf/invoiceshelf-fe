"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { portalService } from "@/lib/portal";
import { Invoice, InvoiceStatus, PaymentStatus } from "@/lib/invoices";
import { formatCurrency, formatDateLong } from "@/lib/format";

export default function PortalInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadInvoice(params.id as string);
    }
  }, [params.id]);

  const loadInvoice = async (id: string) => {
    try {
      const data = await portalService.getInvoice(id);
      setInvoice(data);
    } catch (error) {
      console.error("Failed to load invoice:", error);
      router.push("/portal/invoices");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/invoices"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Invoice {invoice.number}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created on {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}
          >
            {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
          </span>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${paymentStatusColors[invoice.paymentStatus].bg} ${paymentStatusColors[invoice.paymentStatus].text}`}
          >
            {invoice.paymentStatus.charAt(0) +
              invoice.paymentStatus.slice(1).toLowerCase()}
          </span>
          <a
            href={portalService.getDownloadUrl(invoice.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </a>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">From</h3>
            <p className="text-gray-900 font-medium">
              {invoice.user?.username || "Business"}
            </p>
            <p className="text-gray-600">{invoice.user?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Invoice Details
            </h3>
            <div className="space-y-1">
              <p className="text-gray-600">
                <span className="font-medium">Invoice #:</span> {invoice.number}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Due Date:</span>{" "}
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items?.map((invoiceItem) => (
                <tr key={invoiceItem.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoiceItem.item?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    {invoiceItem.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    {formatCurrency(invoiceItem.item?.price || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                    {formatCurrency(
                      invoiceItem.quantity * (invoiceItem.item?.price || 0),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                {formatCurrency(invoice.subTotal || 0)}
              </span>
            </div>
            {invoice.tax && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Tax ({invoice.tax.name} - {invoice.tax.rate}%)
                </span>
                <span className="text-gray-900">
                  {formatCurrency(invoice.taxAmount || 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(invoice.amountDue)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Paid</span>
              <span className="text-green-600">
                {formatCurrency(invoice.amountPaid || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Balance Due</span>
              <span className="font-bold text-red-600">
                {formatCurrency(invoice.amountDue - (invoice.amountPaid || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
