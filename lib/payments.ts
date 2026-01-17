import { api } from "./api";

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
  CHECK = "CHECK",
  OTHER = "OTHER",
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  invoiceId: string;
  invoice?: {
    id: string;
    number: string;
    amountDue: number;
    amountPaid: number;
    customer: {
      id: string;
      companyName: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  reference?: string;
  notes?: string;
}

export interface PaymentSummary {
  totalReceived: number;
  paymentCount: number;
  byMethod: Record<string, number>;
}

class PaymentService {
  async getAll(): Promise<Payment[]> {
    const response = await api.get("/payments");
    return response.data;
  }

  async getById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  async getByInvoice(invoiceId: string): Promise<Payment[]> {
    const response = await api.get(`/payments/invoice/${invoiceId}`);
    return response.data;
  }

  async getSummary(): Promise<PaymentSummary> {
    const response = await api.get("/payments/summary");
    return response.data;
  }

  async create(data: CreatePaymentInput): Promise<Payment> {
    const response = await api.post("/payments", data);
    return response.data;
  }

  async update(id: string, data: UpdatePaymentInput): Promise<Payment> {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/payments/${id}`);
  }

  async downloadReceipt(id: string): Promise<void> {
    const response = await api.get(`/payments/${id}/receipt`, {
      responseType: "blob",
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${id.slice(-8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const paymentService = new PaymentService();
