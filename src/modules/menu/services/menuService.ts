import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PaginatedCategories {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMenuItemPayload {
  name: string;
  categoryId: string;
  price: number;
  isAvailable: boolean;
}

export const menuService = {
  getCategories: async (page = 1, limit = 50) => {
    return await apiClient.get<PaginatedCategories>(`${ENDPOINTS.CATEGORIES.ALL}?page=${page}&limit=${limit}`);
  },

  createMenuItem: async (payload: CreateMenuItemPayload) => {
    return await apiClient.post(ENDPOINTS.MENU.CREATE, payload);
  },
};
