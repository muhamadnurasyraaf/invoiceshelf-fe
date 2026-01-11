import { api } from "./api";

export enum ExpenseCategory {
  RENT = "RENT",
  UTILITIES = "UTILITIES",
  SALARIES = "SALARIES",
  SUPPLIES = "SUPPLIES",
  EQUIPMENT = "EQUIPMENT",
  MARKETING = "MARKETING",
  TRAVEL = "TRAVEL",
  INSURANCE = "INSURANCE",
  TAXES = "TAXES",
  SOFTWARE = "SOFTWARE",
  MAINTENANCE = "MAINTENANCE",
  PROFESSIONAL_SERVICES = "PROFESSIONAL_SERVICES",
  OTHER = "OTHER",
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.RENT]: "Rent",
  [ExpenseCategory.UTILITIES]: "Utilities",
  [ExpenseCategory.SALARIES]: "Salaries",
  [ExpenseCategory.SUPPLIES]: "Supplies",
  [ExpenseCategory.EQUIPMENT]: "Equipment",
  [ExpenseCategory.MARKETING]: "Marketing",
  [ExpenseCategory.TRAVEL]: "Travel",
  [ExpenseCategory.INSURANCE]: "Insurance",
  [ExpenseCategory.TAXES]: "Taxes",
  [ExpenseCategory.SOFTWARE]: "Software",
  [ExpenseCategory.MAINTENANCE]: "Maintenance",
  [ExpenseCategory.PROFESSIONAL_SERVICES]: "Professional Services",
  [ExpenseCategory.OTHER]: "Other",
};

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  vendor?: string;
  reference?: string;
  notes?: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate?: string;
  vendor?: string;
  reference?: string;
  notes?: string;
  receipt?: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  expenseDate?: string;
  vendor?: string;
  reference?: string;
  notes?: string;
  receipt?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  expenseCount: number;
  byCategory: Record<string, number>;
  monthly: Record<number, number>;
}

class ExpenseService {
  async getAll(): Promise<Expense[]> {
    const response = await api.get("/expenses");
    return response.data;
  }

  async getById(id: string): Promise<Expense> {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  }

  async getSummary(): Promise<ExpenseSummary> {
    const response = await api.get("/expenses/summary");
    return response.data;
  }

  async create(data: CreateExpenseInput): Promise<Expense> {
    const response = await api.post("/expenses", data);
    return response.data;
  }

  async update(id: string, data: UpdateExpenseInput): Promise<Expense> {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  }
}

export const expenseService = new ExpenseService();
