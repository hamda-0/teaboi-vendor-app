import { create } from 'zustand';

interface MapState {
  tempData: any | null;
  setTempData: (data: any | null) => void;
  clearTempData: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  tempData: null,
  setTempData: (data) => set({ tempData: data }),
  clearTempData: () => set({ tempData: null }),
}));
