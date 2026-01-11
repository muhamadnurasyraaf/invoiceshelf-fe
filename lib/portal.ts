import { api } from "./api";
import { Invoice } from "./invoices";
import { Estimate } from "./estimates";
import { Payment } from "./payments";

export interface PortalDashboard {
  stats: {
    amountDue: number;
    invoiceCount: number;
    estimateCount: number;
    paymentCount: number;
  };
  dueInvoices: Invoice[];
  recentEstimates: Estimate[];
}

export interface CustomerProfile {
  id: string;
  companyName: string;
  contactPersonName?: string;
  email: string;
  phone: string;
  shippingAddress?: string;
  createdAt: string;
}

export interface UpdateProfileInput {
  companyName?: string;
  contactPersonName?: string;
  phone?: string;
  shippingAddress?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const portalService = {
  // Dashboard
  async getDashboard(): Promise<PortalDashboard> {
    const response = await api.get<PortalDashboard>("/portal/dashboard");
    return response.data;
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>("/portal/invoices");
    return response.data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/portal/invoices/${id}`);
    return response.data;
  },

  getDownloadUrl(invoiceId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl}/invoices/${invoiceId}/pdf`;
  },

  // Estimates
  async getEstimates(): Promise<Estimate[]> {
    const response = await api.get<Estimate[]>("/portal/estimates");
    return response.data;
  },

  async getEstimate(id: string): Promise<Estimate> {
    const response = await api.get<Estimate>(`/portal/estimates/${id}`);
    return response.data;
  },

  async acceptEstimate(id: string): Promise<Estimate> {
    const response = await api.post<Estimate>(`/portal/estimates/${id}/accept`);
    return response.data;
  },

  async rejectEstimate(id: string): Promise<Estimate> {
    const response = await api.post<Estimate>(`/portal/estimates/${id}/reject`);
    return response.data;
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const response = await api.get<Payment[]>("/portal/payments");
    return response.data;
  },

  async getPayment(id: string): Promise<Payment> {
    const response = await api.get<Payment>(`/portal/payments/${id}`);
    return response.data;
  },

  // Profile
  async getProfile(): Promise<CustomerProfile> {
    const response = await api.get<CustomerProfile>("/portal/profile");
    return response.data;
  },

  async updateProfile(data: UpdateProfileInput): Promise<CustomerProfile> {
    const response = await api.patch<CustomerProfile>("/portal/profile", data);
    return response.data;
  },

  async changePassword(
    data: ChangePasswordInput,
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/portal/change-password",
      data,
    );
    return response.data;
  },
};
