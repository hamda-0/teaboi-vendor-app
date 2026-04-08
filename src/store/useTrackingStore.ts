import { create } from 'zustand';
import { VendorRouteDetails } from '@/modules/orders/services/routeService';

interface TrackingState {
  activeRoute: VendorRouteDetails | null;
  isTracking: boolean;
  currentLocation: { lat: number; lng: number } | null;
  error: string | null;

  // Actions
  setActiveRoute: (route: VendorRouteDetails | null) => void;
  setTracking: (isTracking: boolean) => void;
  updateLocation: (lat: number, lng: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  activeRoute: null,
  isTracking: false,
  currentLocation: null,
  error: null,

  setActiveRoute: (route) => set({ activeRoute: route }),
  setTracking: (isTracking) => set({ isTracking }),
  updateLocation: (lat, lng) => set({ currentLocation: { lat, lng } }),
  setError: (error) => set({ error }),
  reset: () => set({ activeRoute: null, isTracking: false, currentLocation: null, error: null }),
}));
