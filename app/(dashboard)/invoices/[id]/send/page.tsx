"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { invoiceService, Invoice, EmailPreview } from "@/lib/invoices";
import { formatCurrency } from "@/lib/format";

export default function SendInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setIsLoading(true);
      const data = await invoiceService.getById(invoiceId);
      setInvoice(data);
      // Load initial preview
      await loadPreview();
    } catch {
      setError("Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreview = async () => {
    try {
      setIsPreviewLoading(true);
      const data = await invoiceService.previewEmail({
        invoiceId,
        subject: subject || undefined,
        customMessage: customMessage || undefined,
      });
      setPreview(data);
      if (!subject) {
        setSubject(data.subject);
      }
    } catch {
      setError("Failed to load email preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePreviewUpdate = async () => {
    await loadPreview();
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      setError(null);
      await invoiceService.sendEmail({
        invoiceId,
        subject: subject || undefined,
        customMessage: customMessage || undefined,
      });
      setSuccess("Invoice email has been queued for sending!");
      setTimeout(() => {
        router.push("/invoices");
      }, 2000);
    } catch {
      setError("Failed to send invoice email");
    } finally {
      setIsSending(false);
    }
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Invoice not found
        </h2>
        <Link
          href="/invoices"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/invoices" className="hover:text-indigo-600">
            Invoices
          </Link>
          <span>/</span>
          <span>{invoice.number}</span>
          <span>/</span>
          <span>Send</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Send Invoice</h1>
        <p className="text-sm text-gray-500 mt-1">
          Preview and customize the email before sending
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Email Settings */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Invoice Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number</span>
                <span className="font-medium text-gray-900">
                  {invoice.number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-900">
                  {invoice.customer.companyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">
                  {invoice.customer.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(invoice.amountDue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Email Customization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customize Email
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
                  placeholder="Invoice subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
                  placeholder="Add a personal message to include in the email..."
                />
              </div>
              <button
                type="button"
                onClick={handlePreviewUpdate}
                disabled={isPreviewLoading}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm disabled:opacity-50"
              >
                {isPreviewLoading ? "Updating Preview..." : "Update Preview"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={isSending || !preview}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Invoice
                </>
              )}
            </button>
            <Link
              href="/invoices"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Right Column - Email Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Email Preview
            </h2>
            {preview && (
              <p className="text-sm text-gray-500 mt-1">To: {preview.to}</p>
            )}
          </div>
          <div className="p-4 h-[600px] overflow-auto bg-gray-100">
            {isPreviewLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : preview ? (
              <iframe
                srcDoc={preview.html}
                className="w-full h-full bg-white rounded-lg shadow-sm"
                title="Email Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Preview not available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
