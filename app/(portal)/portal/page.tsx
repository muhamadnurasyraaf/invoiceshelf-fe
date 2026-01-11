"use client";

import { useAuth } from "@/contexts/auth-context";

export default function CustomerPortalPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {user?.companyName || user?.username}
        </h1>
        <p className="text-gray-500 mt-1">
          View your invoices, estimates, and payment history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                RM 1,250.00
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-500"
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
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                RM 5,430.00
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Invoices
          </h2>
        </div>
        <div className="p-6">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Invoice #</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 text-sm font-medium text-gray-900">
                  INV-001
                </td>
                <td className="py-3 text-sm text-gray-500">Jan 5, 2026</td>
                <td className="py-3 text-sm text-gray-500">Jan 20, 2026</td>
                <td className="py-3 text-sm text-gray-900">RM 500.00</td>
                <td className="py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-900">
                  INV-002
                </td>
                <td className="py-3 text-sm text-gray-500">Dec 28, 2025</td>
                <td className="py-3 text-sm text-gray-500">Jan 12, 2026</td>
                <td className="py-3 text-sm text-gray-900">RM 750.00</td>
                <td className="py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Overdue
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-900">
                  INV-003
                </td>
                <td className="py-3 text-sm text-gray-500">Dec 15, 2025</td>
                <td className="py-3 text-sm text-gray-500">Dec 30, 2025</td>
                <td className="py-3 text-sm text-gray-900">RM 1,200.00</td>
                <td className="py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Paid
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
