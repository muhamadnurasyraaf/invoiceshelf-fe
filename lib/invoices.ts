import { api } from "./api";
import { Customer } from "./customers";
import { Item } from "./items";
import { Tax } from "./taxes";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "UNPAID"
  | "OVERDUE"
  | "REJECTED";

export interface InvoiceItem {
  id: string;
  itemId: string;
  quantity: number;
  item: Item;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  subTotal?: number;
  taxAmount?: number;
  amountDue: number;
  amountPaid?: number;
  dueDate: string;
  notes?: string;
  taxId?: string;
  tax?: Tax;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  user?: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateInvoiceInput {
  number: string;
  customerId: string;
  dueDate: string;
  notes?: string;
  taxId?: string;
  items: InvoiceItemInput[];
}

export interface UpdateInvoiceInput {
  number?: string;
  customerId?: string;
  dueDate?: string;
  notes?: string;
  taxId?: string | null;
  status?: InvoiceStatus;
  items?: InvoiceItemInput[];
}

export interface EmailPreview {
  to: string;
  subject: string;
  html: string;
  invoice: {
    id: string;
    number: string;
    customerName: string;
    customerEmail: string;
    amountDue: number;
    dueDate: string;
  };
}

export interface SendEmailInput {
  invoiceId: string;
  subject?: string;
  customMessage?: string;
}

export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>("/invoices");
    return response.data;
  },

  async getById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  async create(data: CreateInvoiceInput): Promise<Invoice> {
    const response = await api.post<Invoice>("/invoices", data);
    return response.data;
  },

  async update(id: string, data: UpdateInvoiceInput): Promise<Invoice> {
    const response = await api.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/invoices/${id}/status`, {
      status,
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  async previewEmail(data: SendEmailInput): Promise<EmailPreview> {
    const response = await api.post<EmailPreview>(
      "/email/invoice/preview",
      data,
    );
    return response.data;
  },

  async sendEmail(
    data: SendEmailInput,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      "/email/invoice/send",
      data,
    );
    return response.data;
  },
};
