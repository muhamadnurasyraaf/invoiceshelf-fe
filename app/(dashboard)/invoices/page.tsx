"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  invoiceService,
  Invoice,
  InvoiceStatus,
  PaymentStatus,
} from "@/lib/invoices";
import { ocrService, ProcessedInvoiceData } from "@/lib/ocr";
import { formatCurrency, formatDateLong } from "@/lib/format";
import { useToast } from "@/components/ui/toast";

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

export default function InvoicesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<ProcessedInvoiceData | null>(null);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch {
      showToast("Failed to load invoices", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await invoiceService.delete(id);
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
      showToast("Invoice deleted successfully", "success");
    } catch {
      showToast("Failed to delete invoice", "error");
    }
  };

  const handleOcrUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast(
        "Please upload a valid image file (PNG, JPEG, or WebP)",
        "error",
      );
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be less than 10MB", "error");
      return;
    }

    setIsOcrProcessing(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Extract and process invoice data using OCR (creates customers/items if needed)
      const processedData = await ocrService.extractAndProcessInvoice({
        image: base64,
        mimeType: file.type,
      });

      console.log("OCR Processed Data:", processedData);
      setOcrResult(processedData);
      setShowOcrModal(true);
      showToast("Invoice scanned successfully", "success");
    } catch (err) {
      console.error("OCR Error:", err);
      showToast(
        "Failed to extract invoice data from image. Please try again.",
        "error",
      );
    } finally {
      setIsOcrProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUseOcrData = () => {
    if (ocrResult) {
      // Store OCR data in sessionStorage to pass to the new invoice page
      sessionStorage.setItem("ocrInvoiceData", JSON.stringify(ocrResult));
      router.push("/invoices/new?fromOcr=true");
    }
    setShowOcrModal(false);
  };

  const formatDate = (dateString: string) => formatDateLong(dateString);

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
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage invoices for your clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* OCR Upload Button */}
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleOcrUpload}
              className="hidden"
              disabled={isOcrProcessing}
            />
            {isOcrProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Scan Invoice
              </>
            )}
          </label>
          <Link
            href="/invoices/new"
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
            New Invoice
          </Link>
        </div>
      </div>

      {/* OCR Result Modal */}
      {showOcrModal && ocrResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Extracted Invoice Data
                </h2>
                <button
                  onClick={() => setShowOcrModal(false)}
                  className="text-gray-400 hover:text-gray-600"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-4">
                  {ocrResult.invoiceNumber && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Invoice Number
                      </label>
                      <p className="text-sm text-gray-900">
                        {ocrResult.invoiceNumber}
                      </p>
                    </div>
                  )}
                  {ocrResult.invoiceDate && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Invoice Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {ocrResult.invoiceDate}
                      </p>
                    </div>
                  )}
                  {ocrResult.dueDate && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Due Date
                      </label>
                      <p className="text-sm text-gray-900">
                        {ocrResult.dueDate}
                      </p>
                    </div>
                  )}
                  {ocrResult.currency && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Currency
                      </label>
                      <p className="text-sm text-gray-900">
                        {ocrResult.currency}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                {(ocrResult.vendorName || ocrResult.vendorEmail) && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Vendor Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {ocrResult.vendorName && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.vendorName}
                          </p>
                        </div>
                      )}
                      {ocrResult.vendorEmail && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Email
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.vendorEmail}
                          </p>
                        </div>
                      )}
                      {ocrResult.vendorPhone && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Phone
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.vendorPhone}
                          </p>
                        </div>
                      )}
                      {ocrResult.vendorAddress && (
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Address
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.vendorAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                {(ocrResult.customerName || ocrResult.customerEmail) && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {ocrResult.customerName && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.customerName}
                          </p>
                        </div>
                      )}
                      {ocrResult.customerEmail && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Email
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.customerEmail}
                          </p>
                        </div>
                      )}
                      {ocrResult.customerPhone && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Phone
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.customerPhone}
                          </p>
                        </div>
                      )}
                      {ocrResult.customerAddress && (
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Address
                          </label>
                          <p className="text-sm text-gray-900">
                            {ocrResult.customerAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                {ocrResult.items && ocrResult.items.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Line Items
                    </h3>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Description
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                            Unit Price
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ocrResult.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 text-right">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {ocrResult.subtotal !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Subtotal</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(ocrResult.subtotal)}
                        </span>
                      </div>
                    )}
                    {ocrResult.taxRate !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tax Rate</span>
                        <span className="text-sm text-gray-900">
                          {ocrResult.taxRate}%
                        </span>
                      </div>
                    )}
                    {ocrResult.taxAmount !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Tax Amount
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(ocrResult.taxAmount)}
                        </span>
                      </div>
                    )}
                    {ocrResult.total !== undefined && (
                      <div className="flex justify-between font-medium">
                        <span className="text-sm text-gray-700">Total</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(ocrResult.total)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {ocrResult.notes && (
                  <div className="border-t pt-4">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Notes
                    </label>
                    <p className="text-sm text-gray-900">{ocrResult.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowOcrModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUseOcrData}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  Create Invoice with This Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">No invoices yet</p>
                    <Link
                      href="/invoices/new"
                      className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Create your first invoice
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.customer?.companyName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.customer?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full w-fit ${statusColors[invoice.status].bg} ${statusColors[invoice.status].text}`}
                      >
                        {invoice.status.charAt(0) +
                          invoice.status.slice(1).toLowerCase()}
                      </span>
                      <span
                        className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full w-fit ${paymentStatusColors[invoice.paymentStatus].bg} ${paymentStatusColors[invoice.paymentStatus].text}`}
                      >
                        {invoice.paymentStatus.charAt(0) +
                          invoice.paymentStatus.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.amountDue)}
                    </div>
                    {(invoice.amountPaid || 0) > 0 && (
                      <div className="text-xs text-green-600">
                        Paid: {formatCurrency(invoice.amountPaid || 0)}
                      </div>
                    )}
                    {invoice.paymentStatus !== "PAID" &&
                      (invoice.amountPaid || 0) < invoice.amountDue && (
                        <div className="text-xs text-red-500">
                          Due:{" "}
                          {formatCurrency(
                            invoice.amountDue - (invoice.amountPaid || 0),
                          )}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.paymentStatus !== "PAID" &&
                        invoice.status !== "DRAFT" && (
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
                      <Link
                        href={`/invoices/${invoice.id}/send`}
                        className="text-indigo-400 hover:text-indigo-600"
                        title="Send Invoice"
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
                      <Link
                        href={`/invoices/${invoice.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit Invoice"
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
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete Invoice"
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
