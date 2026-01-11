import { api } from "./api";

export interface Customer {
  id: string;
  companyName: string;
  contactPersonName?: string;
  email: string;
  phone: string;
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  companyName: string;
  contactPersonName?: string;
  email: string;
  password: string;
  phone: string;
  shippingAddress?: string;
}

export interface UpdateCustomerInput {
  companyName?: string;
  contactPersonName?: string;
  email?: string;
  password?: string;
  phone?: string;
  shippingAddress?: string;
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await api.get<Customer[]>("/customers");
    return response.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async create(data: CreateCustomerInput): Promise<Customer> {
    const response = await api.post<Customer>("/customers", data);
    return response.data;
  },

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
