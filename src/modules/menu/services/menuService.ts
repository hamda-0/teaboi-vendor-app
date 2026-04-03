import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';

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

export interface MenuItem {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  price: string; 
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  category?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export interface PaginatedMenu {
  data: MenuItem[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateMenuResponse {
  data: MenuItem;
  message: string;
}

export interface ToggleAvailabilityResponse {
  message: string;
  data?: MenuItem;
}

export interface DeleteMenuResponse {
  message: string;
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
  
  getVendorMenu: async (page = 1, limit = 50) => {
    return await apiClient.get<ApiResponse<PaginatedMenu>>(`${ENDPOINTS.VENDOR_MENU.LIST}?page=${page}&limit=${limit}`);
  },

  deleteMenuItem: async (id: string) => {
    return await apiClient.delete<ApiResponse<DeleteMenuResponse>>(ENDPOINTS.VENDOR_MENU.DELETE(id));
  },

  updateMenuItem: async (id: string, payload: Partial<CreateMenuItemPayload>) => {
    const response = await apiClient.put<ApiResponse<UpdateMenuResponse>>(ENDPOINTS.VENDOR_MENU.UPDATE(id), payload);
    return response;
  },

  toggleMenuItemStatus: async (id: string) => {
    return await apiClient.patch<ApiResponse<ToggleAvailabilityResponse>>(ENDPOINTS.VENDOR_MENU.TOGGLE_STATUS(id));
  },
};
