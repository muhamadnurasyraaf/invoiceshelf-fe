"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { portalService } from "@/lib/portal";
import { Estimate } from "@/lib/estimates";
import { formatCurrency, formatDateLong } from "@/lib/format";

export default function PortalEstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadEstimate(params.id as string);
    }
  }, [params.id]);

  const loadEstimate = async (id: string) => {
    try {
      const data = await portalService.getEstimate(id);
      setEstimate(data);
    } catch (error) {
      console.error("Failed to load estimate:", error);
      router.push("/portal/estimates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!estimate) return;
    setIsSubmitting(true);
    try {
      const updated = await portalService.acceptEstimate(estimate.id);
      setEstimate(updated);
    } catch (error) {
      console.error("Failed to accept estimate:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!estimate) return;
    setIsSubmitting(true);
    try {
      const updated = await portalService.rejectEstimate(estimate.id);
      setEstimate(updated);
    } catch (error) {
      console.error("Failed to reject estimate:", error);
    } finally {
      setIsSubmitting(false);
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
        className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  const canRespond = estimate && ["SENT", "VIEWED"].includes(estimate.status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Estimate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/estimates"
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
              Estimate {estimate.number}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created on {formatDate(estimate.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(estimate.status)}
          {canRespond && (
            <>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Accept
              </button>
            </>
          )}
        </div>
      </div>

      {/* Estimate Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">From</h3>
            <p className="text-gray-900 font-medium">
              {estimate.user?.username || "Business"}
            </p>
            <p className="text-gray-600">{estimate.user?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Estimate Details
            </h3>
            <div className="space-y-1">
              <p className="text-gray-600">
                <span className="font-medium">Estimate #:</span>{" "}
                {estimate.number}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Expiry Date:</span>{" "}
                {formatDate(estimate.expiryDate)}
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
              {estimate.items?.map((estimateItem) => (
                <tr key={estimateItem.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {estimateItem.item?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    {estimateItem.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    {formatCurrency(estimateItem.item?.price || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                    {formatCurrency(
                      estimateItem.quantity * (estimateItem.item?.price || 0),
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
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(estimate.amountDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {estimate.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-600">{estimate.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
