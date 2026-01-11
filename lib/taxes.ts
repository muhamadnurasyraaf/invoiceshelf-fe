import { api } from "./api";

export interface Tax {
  id: string;
  name: string;
  rate: number;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxInput {
  name: string;
  rate: number;
  description?: string;
  isDefault?: boolean;
}

export interface UpdateTaxInput {
  name?: string;
  rate?: number;
  description?: string;
  isDefault?: boolean;
}

class TaxService {
  async getAll(): Promise<Tax[]> {
    const response = await api.get("/taxes");
    return response.data;
  }

  async getById(id: string): Promise<Tax> {
    const response = await api.get(`/taxes/${id}`);
    return response.data;
  }

  async getDefault(): Promise<Tax | null> {
    const response = await api.get("/taxes/default");
    return response.data;
  }

  async create(data: CreateTaxInput): Promise<Tax> {
    const response = await api.post("/taxes", data);
    return response.data;
  }

  async update(id: string, data: UpdateTaxInput): Promise<Tax> {
    const response = await api.put(`/taxes/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/taxes/${id}`);
  }
}

export const taxService = new TaxService();
