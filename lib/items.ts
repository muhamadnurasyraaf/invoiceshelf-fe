import { api } from "./api";

export interface Item {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemInput {
  name: string;
  price?: number;
}

export interface UpdateItemInput {
  name?: string;
  price?: number;
}

export const itemService = {
  async getAll(): Promise<Item[]> {
    const response = await api.get<Item[]>("/items");
    return response.data;
  },

  async getById(id: string): Promise<Item> {
    const response = await api.get<Item>(`/items/${id}`);
    return response.data;
  },

  async create(data: CreateItemInput): Promise<Item> {
    const response = await api.post<Item>("/items", data);
    return response.data;
  },

  async update(id: string, data: UpdateItemInput): Promise<Item> {
    const response = await api.put<Item>(`/items/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/items/${id}`);
  },
};
