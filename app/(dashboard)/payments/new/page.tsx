"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { PaymentMethod, paymentService } from "@/lib/payments";
import { Invoice, invoiceService } from "@/lib/invoices";
import { formatCurrency } from "@/lib/format";

const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDate: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const paymentMethodOptions = [
  { value: PaymentMethod.CASH, label: "Cash" },
  { value: PaymentMethod.BANK_TRANSFER, label: "Bank Transfer" },
  { value: PaymentMethod.CREDIT_CARD, label: "Credit Card" },
  { value: PaymentMethod.DEBIT_CARD, label: "Debit Card" },
  { value: PaymentMethod.PAYPAL, label: "PayPal" },
  { value: PaymentMethod.STRIPE, label: "Stripe" },
  { value: PaymentMethod.CHECK, label: "Check" },
  { value: PaymentMethod.OTHER, label: "Other" },
];

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedInvoiceId = searchParams.get("invoiceId");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: preselectedInvoiceId || "",
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  const watchInvoiceId = watch("invoiceId");

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (watchInvoiceId) {
      const invoice = invoices.find((i) => i.id === watchInvoiceId);
      setSelectedInvoice(invoice || null);
      if (invoice) {
        const remainingBalance = invoice.amountDue - (invoice.amountPaid || 0);
        setValue("amount", remainingBalance);
      }
    } else {
      setSelectedInvoice(null);
    }
  }, [watchInvoiceId, invoices, setValue]);

  const fetchInvoices = async () => {
    try {
      const data = await invoiceService.getAll();
      // Filter to show only unpaid/partially paid invoices
      const unpaidInvoices = data.filter(
        (inv) => inv.paymentStatus !== "PAID" && inv.status !== "DRAFT",
      );
      setInvoices(unpaidInvoices);

      if (preselectedInvoiceId) {
        const invoice = data.find((i) => i.id === preselectedInvoiceId);
        if (invoice) {
          setSelectedInvoice(invoice);
          const remainingBalance =
            invoice.amountDue - (invoice.amountPaid || 0);
          setValue("amount", remainingBalance);
        }
      }
    } catch (err) {
      setError("Failed to fetch invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setSubmitting(true);
    setError("");

    try {
      await paymentService.create(data);
      router.push("/payments");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to record payment");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Record Payment</h1>
        <Link href="/payments" className="text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-lg p-6 space-y-6"
      >
        {/* Invoice Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice *
          </label>
          <select
            {...register("invoiceId")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">Select an invoice</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.number} - {invoice.customer?.companyName} (
                {formatCurrency(invoice.amountDue - (invoice.amountPaid || 0))}{" "}
                remaining)
              </option>
            ))}
          </select>
          {errors.invoiceId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.invoiceId.message}
            </p>
          )}
        </div>

        {/* Invoice Summary */}
        {selectedInvoice && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-900">Invoice Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Amount:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatCurrency(selectedInvoice.amountDue)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Already Paid:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatCurrency(selectedInvoice.amountPaid || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Remaining Balance:</span>
                <span className="ml-2 font-medium text-red-600">
                  {formatCurrency(
                    selectedInvoice.amountDue -
                      (selectedInvoice.amountPaid || 0),
                  )}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {selectedInvoice.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount *
          </label>
          <input
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method *
          </label>
          <select
            {...register("paymentMethod")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            {paymentMethodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <p className="text-red-500 text-sm mt-1">
              {errors.paymentMethod.message}
            </p>
          )}
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Date
          </label>
          <input
            type="date"
            {...register("paymentDate")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>

        {/* Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference / Transaction ID
          </label>
          <input
            type="text"
            {...register("reference")}
            placeholder="e.g., TXN-123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/payments"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Recording..." : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
