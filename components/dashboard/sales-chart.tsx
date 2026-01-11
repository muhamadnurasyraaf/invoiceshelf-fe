"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { MonthlyData, DashboardSummary } from "@/lib/dashboard";

interface SalesChartProps {
  monthlyData?: MonthlyData;
  summary?: DashboardSummary;
}

export function SalesChart({ monthlyData, summary }: SalesChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Transform data for the chart
  const chartData = monthlyData
    ? monthlyData.labels.map((label, index) => ({
        month: label,
        income: monthlyData.income[index] || 0,
        expenses: monthlyData.expenses[index] || 0,
        netIncome: monthlyData.netIncome[index] || 0,
      }))
    : [];

  // Calculate max value for Y axis
  const maxValue = Math.max(
    ...chartData.map((d) =>
      Math.max(d.income, d.expenses, Math.abs(d.netIncome)),
    ),
  );
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000 || 1000;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-100 rounded flex items-center justify-center">
            <svg
              className="w-3 h-3 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900">
            Income & Expenses
          </h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span className="text-gray-600">Net Income</span>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Chart */}
        <div className="flex-1 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                domain={[0, yAxisMax]}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Stats */}
        <div className="w-44 flex flex-col justify-center gap-6">
          <div>
            <p className="text-xs text-gray-500 text-right">Total Invoiced</p>
            <p className="text-xl font-bold text-gray-900 text-right">
              {formatCurrency(summary?.totalInvoiced || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 text-right">Total Received</p>
            <p className="text-xl font-bold text-green-500 text-right">
              {formatCurrency(summary?.totalReceived || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 text-right">Total Expenses</p>
            <p className="text-xl font-bold text-red-500 text-right">
              {formatCurrency(summary?.totalExpenses || 0)}
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-right">Net Income</p>
            <p
              className={`text-xl font-bold text-right ${
                (summary?.netIncome || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(summary?.netIncome || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Net Income Line Chart */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-4">
          Net Income Trend
        </h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Line
                type="monotone"
                dataKey="netIncome"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
