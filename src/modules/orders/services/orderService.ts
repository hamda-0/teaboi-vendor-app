import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  routeId?: string | null;
  serviceZoneId?: string | null;
  orderType: 'instant' | 'preorder';
  status:
    | 'created'
    | 'accepted'
    | 'preparing'
    | 'on_route'
    | 'delivered'
    | 'rejected'
    | 'cancelled'
    | string;
  locationLat: number;
  locationLng: number;
  address: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  // optional extras that UI may use
  items?: OrderItem[];
  vendorName?: string;
}

export const orderService = {
  getOrderHistory: async (): Promise<ApiResponse<Order[]>> => {
    return apiClient.get(ENDPOINTS.ORDERS.HISTORY);
  },
};
