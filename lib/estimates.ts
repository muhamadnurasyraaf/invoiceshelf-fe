import { api } from "./api";
import { Customer } from "./customers";
import { Item } from "./items";

export type EstimateStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface EstimateItem {
  id: string;
  itemId: string;
  quantity: number;
  item: Item;
}

export interface Estimate {
  id: string;
  number: string;
  status: EstimateStatus;
  amountDue: number;
  expiryDate: string;
  notes?: string;
  customerId: string;
  customer: Customer;
  items: EstimateItem[];
  user?: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EstimateItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateEstimateInput {
  number: string;
  customerId: string;
  expiryDate: string;
  notes?: string;
  items: EstimateItemInput[];
}

export interface UpdateEstimateInput {
  number?: string;
  customerId?: string;
  expiryDate?: string;
  notes?: string;
  status?: EstimateStatus;
  items?: EstimateItemInput[];
}

export const estimateService = {
  async getAll(): Promise<Estimate[]> {
    const response = await api.get<Estimate[]>("/estimates");
    return response.data;
  },

  async getById(id: string): Promise<Estimate> {
    const response = await api.get<Estimate>(`/estimates/${id}`);
    return response.data;
  },

  async create(data: CreateEstimateInput): Promise<Estimate> {
    const response = await api.post<Estimate>("/estimates", data);
    return response.data;
  },

  async update(id: string, data: UpdateEstimateInput): Promise<Estimate> {
    const response = await api.put<Estimate>(`/estimates/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: EstimateStatus): Promise<Estimate> {
    const response = await api.patch<Estimate>(`/estimates/${id}/status`, {
      status,
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/estimates/${id}`);
  },
};
