"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { customerService, Customer } from "@/lib/customers";
import { invoiceService, Invoice, InvoiceStatus, PaymentStatus } from "@/lib/invoices";
import { formatCurrency, formatDateLong } from "@/lib/format";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [customerData, allInvoices] = await Promise.all([
        customerService.getById(customerId),
        invoiceService.getAll(),
      ]);
      setCustomer(customerData);
      // Filter invoices for this customer
      setInvoices(allInvoices.filter((inv) => inv.customerId === customerId));
    } catch {
      setError("Failed to load customer data");
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<InvoiceStatus, { bg: string; text: string }> = {
    DRAFT: { bg: "bg-gray-100", text: "text-gray-700" },
    SENT: { bg: "bg-blue-100", text: "text-blue-700" },
    VIEWED: { bg: "bg-purple-100", text: "text-purple-700" },
    COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
    REJECTED: { bg: "bg-red-100", text: "text-red-700" },
  };

  const paymentStatusColors: Record<PaymentStatus, { bg: string; text: string }> = {
    UNPAID: { bg: "bg-yellow-100", text: "text-yellow-700" },
    PARTIAL: { bg: "bg-orange-100", text: "text-orange-700" },
    PAID: { bg: "bg-green-100", text: "text-green-700" },
    OVERDUE: { bg: "bg-red-100", text: "text-red-700" },
  };

  // Calculate stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!customer && !isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Customer not found
        </h2>
        <p className="text-gray-500 mb-4">
          The customer you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/customers"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/customers" className="hover:text-indigo-600">
            Customers
          </Link>
          <span>/</span>
          <span>{customer?.companyName}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {customer?.companyName}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/invoices/new?customerId=${customerId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Invoice
            </Link>
            <Link
              href={`/customers/${customerId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-4">
              {customer?.contactPersonName && (
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="text-gray-900">{customer.contactPersonName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a
                  href={`mailto:${customer?.email}`}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {customer?.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a
                  href={`tel:${customer?.phone}`}
                  className="text-gray-900 hover:text-indigo-600"
                >
                  {customer?.phone}
                </a>
              </div>
              {customer?.shippingAddress && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 whitespace-pre-line">
                    {customer.shippingAddress}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Customer Since</p>
                <p className="text-gray-900">
                  {formatDateLong(customer?.createdAt || "")}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Total Invoiced</p>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(totalInvoiced)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-green-600 font-medium">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">Outstanding</p>
                <p className={`font-semibold ${totalOutstanding > 0 ? "text-red-600" : "text-gray-900"}`}>
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Total Invoices</p>
                <p className="text-gray-900">{invoices.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
            </div>
            {invoices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 mb-4">No invoices yet</p>
                <Link
                  href={`/invoices/new?customerId=${customerId}`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create first invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            {invoice.number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateLong(invoice.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex w-fit text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}
                            >
                              {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                            </span>
                            <span
                              className={`inline-flex w-fit text-xs font-medium px-2 py-0.5 rounded-full ${paymentStatusColors[invoice.paymentStatus].bg} ${paymentStatusColors[invoice.paymentStatus].text}`}
                            >
                              {invoice.paymentStatus.charAt(0) + invoice.paymentStatus.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.amountDue)}
                          </div>
                          {(invoice.amountPaid || 0) > 0 && invoice.paymentStatus !== "PAID" && (
                            <div className="text-xs text-gray-500">
                              Paid: {formatCurrency(invoice.amountPaid || 0)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/invoices/${invoice.id}/edit`}
                              className="text-gray-400 hover:text-gray-600"
                              title="Edit"
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
                            <Link
                              href={`/invoices/${invoice.id}/send`}
                              className="text-indigo-400 hover:text-indigo-600"
                              title="Send"
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
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </Link>
                            {invoice.paymentStatus !== "PAID" && invoice.status !== "DRAFT" && (
                              <Link
                                href={`/payments/new?invoiceId=${invoice.id}`}
                                className="text-green-500 hover:text-green-700"
                                title="Record Payment"
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
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
