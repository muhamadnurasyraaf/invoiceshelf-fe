import { api } from "./api";

export interface MonthlyProfitLoss {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface ProfitLossReport {
  year: number;
  monthlyData: MonthlyProfitLoss[];
  totals: {
    income: number;
    expenses: number;
    profit: number;
  };
}

export interface MonthlySales {
  month: string;
  invoiced: number;
  collected: number;
  count: number;
}

export interface CustomerSales {
  customerId: string;
  customerName: string;
  totalInvoiced: number;
  totalPaid: number;
  invoiceCount: number;
}

export interface ItemSales {
  itemId: string;
  itemName: string;
  quantity: number;
  revenue: number;
}

export interface SalesReport {
  year: number;
  monthlySales: MonthlySales[];
  salesByCustomer: CustomerSales[];
  salesByItem: ItemSales[];
  totals: {
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    invoiceCount: number;
  };
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  count: number;
}

export interface VendorExpense {
  vendor: string;
  amount: number;
  count: number;
}

export interface ExpenseReport {
  year: number;
  monthlyExpenses: MonthlyExpense[];
  expensesByCategory: CategoryExpense[];
  expensesByVendor: VendorExpense[];
  totals: {
    totalExpenses: number;
    expenseCount: number;
    averageExpense: number;
  };
}

export interface CustomerStats {
  customerId: string;
  companyName: string;
  contactPerson: string | null;
  email: string;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  invoiceCount: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export interface CustomerReport {
  customers: CustomerStats[];
  totals: {
    totalCustomers: number;
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
  };
}

export interface MonthlyTax {
  month: string;
  taxAmount: number;
}

export interface TaxByType {
  taxId: string;
  taxName: string;
  taxRate: number;
  taxAmount: number;
  invoiceCount: number;
}

export interface TaxReport {
  year: number;
  monthlyTax: MonthlyTax[];
  taxByType: TaxByType[];
  totals: {
    totalTaxCollected: number;
    totalTaxableAmount: number;
    invoiceCount: number;
  };
}

export interface MonthlyPayment {
  month: string;
  amount: number;
}

export interface PaymentByMethod {
  method: string;
  amount: number;
  count: number;
}

export interface PaymentReport {
  year: number;
  monthlyPayments: MonthlyPayment[];
  paymentsByMethod: PaymentByMethod[];
  totals: {
    totalPayments: number;
    paymentCount: number;
    averagePayment: number;
  };
}

export const reportsService = {
  async getProfitLoss(year?: number): Promise<ProfitLossReport> {
    const params = year ? `?year=${year}` : "";
    const response = await api.get(`/reports/profit-loss${params}`);
    return response.data;
  },

  async getSales(year?: number): Promise<SalesReport> {
    const params = year ? `?year=${year}` : "";
    const response = await api.get(`/reports/sales${params}`);
    return response.data;
  },

  async getExpenses(year?: number): Promise<ExpenseReport> {
    const params = year ? `?year=${year}` : "";
    const response = await api.get(`/reports/expenses${params}`);
    return response.data;
  },

  async getCustomers(): Promise<CustomerReport> {
    const response = await api.get("/reports/customers");
    return response.data;
  },

  async getTax(year?: number): Promise<TaxReport> {
    const params = year ? `?year=${year}` : "";
    const response = await api.get(`/reports/tax${params}`);
    return response.data;
  },

  async getPayments(year?: number): Promise<PaymentReport> {
    const params = year ? `?year=${year}` : "";
    const response = await api.get(`/reports/payments${params}`);
    return response.data;
  },

  async downloadPdf(reportType: string, year?: number): Promise<void> {
    const params = year ? `?year=${year}` : "";
    const response = await api.get(`/reports/${reportType}/pdf${params}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report${year ? `-${year}` : ""}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
