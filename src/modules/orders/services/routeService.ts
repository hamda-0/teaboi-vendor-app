import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import { Alert } from 'react-native';

export interface RoutePoint {
  lat: number;
  lng: number;
}

 interface Zone {
  id?: string;
  routeId?: string;
  zone: [number, number][];
}

 interface routeZones{
  id:string;
  routeId:string;
  zone:Zone[]
}
export interface VendorRouteDetails {
  id: string;
  endTime: string;
  approvedById?: string;
  approvedAt?: string | null;   
  rejectedAt?: string | null;   
  vendorId?: string;             
  createdAt?: string;            
  updatedAt?: string;            
  isApproved?: boolean;          
  name: string;
  startTime: string;
  status:  "cancelled" | "approved" | "rejected" | "expired"|"incomplete"|"completed"|"active"|"planned";
  rejectionReason?: string | null;
  routePath: [number, number][];
  routeZones: routeZones[];
}
export interface CreateRouteRequest {
  name: string;
  startTime: string;
  endTime: string;
  routePath: RoutePoint[];
  zones: { coordinates: RoutePoint[] }[];
}
export const routeService = {
  createRoute: async (data: CreateRouteRequest) => {
    // Alert.alert('Create Route Request', JSON.stringify(data, null, 2));
    const response = await apiClient.post(ENDPOINTS.VENDOR_ROUTES.CREATE, data);
    console.log('Create Route Response:', JSON.stringify(response, null, 2));
    // Alert.alert('Create Route Response', JSON.stringify(response, null, 2));//todo
    return response;
  },
  getAllRoutes: async (page = 1, limit = 10) => {
    return apiClient.get(ENDPOINTS.VENDOR_ROUTES.ALL, {
      params: { page, limit },
    });
  },
  getRouteDetails: async (id: string): Promise<ApiResponse<{
  data: VendorRouteDetails;
  message: string;
  }>> => {
     const response = await apiClient.get(ENDPOINTS.VENDOR_ROUTES.DETAILS(id));
     return response;
  },
  cancelRoute: async (id: string) => {
    const response = await apiClient.patch(ENDPOINTS.VENDOR_ROUTES.CANCEL(id));
    console.log('Cancel Route Response:', response);
    return response;
  },
  updateRoute: async (id: string, data: Partial<CreateRouteRequest>) => {
    const response = await apiClient.put(ENDPOINTS.VENDOR_ROUTES.UPDATE(id), data);
    console.log('Update Route Response:', response);
    return response;
  },
};
