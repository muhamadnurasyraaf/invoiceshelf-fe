import { api } from "./api";
import { Customer } from "./customers";
import { Item } from "./items";

export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type RecurringInvoiceStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export interface RecurringInvoiceItem {
  id: string;
  itemId: string;
  quantity: number;
  item: Item;
}

export interface RecurringInvoice {
  id: string;
  name: string;
  frequency: RecurringFrequency;
  status: RecurringInvoiceStatus;
  startDate: string;
  endDate?: string;
  nextInvoiceDate: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  dueAfterDays: number;
  notes?: string;
  customerId: string;
  customer: Customer;
  items: RecurringInvoiceItem[];
  generatedCount: number;
  lastGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringInvoiceItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateRecurringInvoiceInput {
  name: string;
  customerId: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  dueAfterDays?: number;
  notes?: string;
  items: RecurringInvoiceItemInput[];
}

export interface UpdateRecurringInvoiceInput {
  name?: string;
  customerId?: string;
  frequency?: RecurringFrequency;
  status?: RecurringInvoiceStatus;
  startDate?: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  dueAfterDays?: number;
  notes?: string;
  items?: RecurringInvoiceItemInput[];
}

export const recurringInvoiceService = {
  async getAll(): Promise<RecurringInvoice[]> {
    const response = await api.get<RecurringInvoice[]>("/recurring-invoices");
    return response.data;
  },

  async getById(id: string): Promise<RecurringInvoice> {
    const response = await api.get<RecurringInvoice>(
      `/recurring-invoices/${id}`
    );
    return response.data;
  },

  async create(data: CreateRecurringInvoiceInput): Promise<RecurringInvoice> {
    const response = await api.post<RecurringInvoice>(
      "/recurring-invoices",
      data
    );
    return response.data;
  },

  async update(
    id: string,
    data: UpdateRecurringInvoiceInput
  ): Promise<RecurringInvoice> {
    const response = await api.put<RecurringInvoice>(
      `/recurring-invoices/${id}`,
      data
    );
    return response.data;
  },

  async updateStatus(
    id: string,
    status: RecurringInvoiceStatus
  ): Promise<RecurringInvoice> {
    const response = await api.patch<RecurringInvoice>(
      `/recurring-invoices/${id}/status`,
      { status }
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recurring-invoices/${id}`);
  },

  async triggerGeneration(): Promise<void> {
    await api.post("/scheduler/trigger-recurring");
  },
};
