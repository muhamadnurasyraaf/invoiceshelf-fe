"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { portalService } from "@/lib/portal";
import { Payment } from "@/lib/payments";

export default function PortalPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await portalService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPaymentMethod = (method: string) => {
    return method.replace(/_/g, " ");
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

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
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            View your payment history
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalPayments)}
          </p>
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
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4">
                      {payment.invoice ? (
                        <Link
                          href={`/portal/invoices/${payment.invoice.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {payment.invoice.number}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPaymentMethod(payment.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {payment.reference || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                      {formatCurrency(payment.amount)}
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
