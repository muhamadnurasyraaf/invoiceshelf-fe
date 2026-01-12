"use client";

import { useEffect, useState } from "react";
import {
  reportsService,
  ProfitLossReport,
  SalesReport,
  ExpenseReport,
  CustomerReport,
  TaxReport,
  PaymentReport,
} from "@/lib/reports";
import { formatCurrency } from "@/lib/format";

type ReportType =
  | "profit-loss"
  | "sales"
  | "expenses"
  | "customers"
  | "tax"
  | "payments";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("profit-loss");
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Report data
  const [profitLoss, setProfitLoss] = useState<ProfitLossReport | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [expenses, setExpenses] = useState<ExpenseReport | null>(null);
  const [customers, setCustomers] = useState<CustomerReport | null>(null);
  const [tax, setTax] = useState<TaxReport | null>(null);
  const [payments, setPayments] = useState<PaymentReport | null>(null);

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  useEffect(() => {
    loadReport();
  }, [activeReport, year]);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await reportsService.downloadPdf(
        activeReport,
        activeReport !== "customers" ? year : undefined,
      );
    } catch {
      setError("Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeReport) {
        case "profit-loss":
          setProfitLoss(await reportsService.getProfitLoss(year));
          break;
        case "sales":
          setSales(await reportsService.getSales(year));
          break;
        case "expenses":
          setExpenses(await reportsService.getExpenses(year));
          break;
        case "customers":
          setCustomers(await reportsService.getCustomers());
          break;
        case "tax":
          setTax(await reportsService.getTax(year));
          break;
        case "payments":
          setPayments(await reportsService.getPayments(year));
          break;
      }
    } catch {
      setError("Failed to load report");
    } finally {
      setIsLoading(false);
    }
  };

  const reportTabs = [
    { id: "profit-loss", label: "Profit & Loss" },
    { id: "sales", label: "Sales" },
    { id: "expenses", label: "Expenses" },
    { id: "customers", label: "Customers" },
    { id: "tax", label: "Tax" },
    { id: "payments", label: "Payments" },
  ];

  const renderProfitLossReport = () => {
    if (!profitLoss) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(profitLoss.totals.income)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(profitLoss.totals.expenses)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Net Profit</p>
            <p
              className={`text-2xl font-bold ${profitLoss.totals.profit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(profitLoss.totals.profit)}
            </p>
          </div>
        </div>

        {/* Monthly Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Breakdown
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Month
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Income
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Expenses
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profitLoss.monthlyData.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.month}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">
                    {formatCurrency(row.income)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600">
                    {formatCurrency(row.expenses)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-medium ${row.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                  {formatCurrency(profitLoss.totals.income)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                  {formatCurrency(profitLoss.totals.expenses)}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-right font-bold ${profitLoss.totals.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(profitLoss.totals.profit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderSalesReport = () => {
    if (!sales) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Invoiced</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(sales.totals.totalInvoiced)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(sales.totals.totalCollected)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(sales.totals.totalOutstanding)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">
              {sales.totals.invoiceCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Customer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales by Customer
              </h3>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Invoiced
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Paid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.salesByCustomer.slice(0, 10).map((row) => (
                    <tr key={row.customerId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.customerName}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {formatCurrency(row.totalInvoiced)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {formatCurrency(row.totalPaid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales by Item */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales by Item
              </h3>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Qty Sold
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.salesByItem.slice(0, 10).map((row) => (
                    <tr key={row.itemId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.itemName}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {row.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {formatCurrency(row.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExpenseReport = () => {
    if (!expenses) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(expenses.totals.totalExpenses)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Expense Count</p>
            <p className="text-2xl font-bold text-gray-900">
              {expenses.totals.expenseCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Average Expense</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(expenses.totals.averageExpense)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Expenses by Category
              </h3>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Count
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.expensesByCategory.map((row) => (
                    <tr key={row.category} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.category.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">
                        {row.count}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Vendor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Expenses by Vendor
              </h3>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendor
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Count
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.expensesByVendor.slice(0, 10).map((row) => (
                    <tr key={row.vendor} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.vendor}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">
                        {row.count}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerReport = () => {
    if (!customers) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">
              {customers.totals.totalCustomers}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Invoiced</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(customers.totals.totalInvoiced)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(customers.totals.totalCollected)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(customers.totals.totalOutstanding)}
            </p>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Invoices
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Invoiced
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Outstanding
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Overdue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.customers.map((row) => (
                  <tr key={row.customerId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {row.companyName}
                      </div>
                      <div className="text-sm text-gray-500">{row.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {row.invoiceCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(row.totalInvoiced)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {formatCurrency(row.totalPaid)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {formatCurrency(row.outstanding)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {row.overdueInvoices > 0 ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {row.overdueInvoices}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTaxReport = () => {
    if (!tax) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Tax Collected</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(tax.totals.totalTaxCollected)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Taxable Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(tax.totals.totalTaxableAmount)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Taxed Invoices</p>
            <p className="text-2xl font-bold text-gray-900">
              {tax.totals.invoiceCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Tax */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Tax Collected
              </h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Tax Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tax.monthlyTax.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-indigo-600">
                      {formatCurrency(row.taxAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax by Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Tax by Type
              </h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tax Name
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Invoices
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tax.taxByType.map((row) => (
                  <tr key={row.taxId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.taxName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {row.taxRate}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {row.invoiceCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-indigo-600">
                      {formatCurrency(row.taxAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentReport = () => {
    if (!payments) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Payments</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(payments.totals.totalPayments)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Payment Count</p>
            <p className="text-2xl font-bold text-gray-900">
              {payments.totals.paymentCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Average Payment</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(payments.totals.averagePayment)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Payments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Payments
              </h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.monthlyPayments.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {formatCurrency(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payments by Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Payments by Method
              </h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Count
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.paymentsByMethod.map((row) => (
                  <tr key={row.method} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.method.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {row.count}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {formatCurrency(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      );
    }

    switch (activeReport) {
      case "profit-loss":
        return renderProfitLossReport();
      case "sales":
        return renderSalesReport();
      case "expenses":
        return renderExpenseReport();
      case "customers":
        return renderCustomerReport();
      case "tax":
        return renderTaxReport();
      case "payments":
        return renderPaymentReport();
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            View detailed financial reports and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeReport !== "customers" && (
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isDownloading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeReport === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
}
