"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { portalService } from "@/lib/portal";
import { Estimate } from "@/lib/estimates";
import { formatCurrency, formatDateLong } from "@/lib/format";

export default function PortalEstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      const data = await portalService.getEstimates();
      setEstimates(data);
    } catch (error) {
      console.error("Failed to load estimates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => formatDateLong(date);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      SENT: "bg-blue-100 text-blue-800",
      VIEWED: "bg-purple-100 text-purple-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      EXPIRED: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  const filteredEstimates = estimates.filter((estimate) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return ["SENT", "VIEWED"].includes(estimate.status);
    if (filter === "accepted") return estimate.status === "ACCEPTED";
    if (filter === "rejected") return estimate.status === "REJECTED";
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
          <h1 className="text-2xl font-semibold text-gray-900">Estimates</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and respond to estimates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="all">All Estimates</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
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
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No estimates found
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((estimate) => (
                  <tr key={estimate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(estimate.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/portal/estimates/${estimate.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {estimate.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(estimate.expiryDate)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(estimate.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                      {formatCurrency(estimate.amountDue)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/portal/estimates/${estimate.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View
                      </Link>
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
