import { api } from "./api";

export interface DashboardSummary {
  totalInvoiced: number;
  totalReceived: number;
  totalExpenses: number;
  netIncome: number;
  totalOutstanding: number;
  customerCount: number;
  invoiceCount: number;
  estimateCount: number;
  overdueCount: number;
}

export interface MonthlyData {
  labels: string[];
  income: number[];
  expenses: number[];
  netIncome: number[];
}

export interface RecentInvoice {
  id: string;
  number: string;
  amountDue: number;
  status: string;
  createdAt: string;
  customer: {
    id: string;
    companyName: string;
  };
}

export interface RecentPayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  invoice: {
    id: string;
    number: string;
    customer: {
      companyName: string;
    };
  };
}

export interface RecentExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
}

export interface DashboardStats {
  summary: DashboardSummary;
  invoicesByStatus: Record<string, number>;
  estimatesByStatus: Record<string, number>;
  monthlyData: MonthlyData;
  expensesByCategory: Record<string, number>;
  recentActivity: {
    invoices: RecentInvoice[];
    payments: RecentPayment[];
    expenses: RecentExpense[];
  };
  overdueInvoices: RecentInvoice[];
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get("/dashboard/stats");
    return response.data;
  }
}

export const dashboardService = new DashboardService();
