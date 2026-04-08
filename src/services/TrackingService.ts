import * as Location from 'expo-location';
import { socketService } from './socketService';
import { useTrackingStore } from '@/store/useTrackingStore';
import { VendorRouteDetails } from '@/modules/orders/services/routeService';
import { Alert } from 'react-native';

// Module-level variable to store the listener (survives screen unmounts)
let locationSubscription: Location.LocationSubscription | null = null;

export const trackingService = {
  async startTracking(route: VendorRouteDetails) {
    try {
      // 1. Request Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is strictly required to track your route.');
        return;
      }

      // 2. Connect Socket (Ensures socket is ON)
      socketService.connect();
      
      if (route.status?.toUpperCase() !== 'ACTIVE') {
        socketService.startRoute(route.id);
      } else {
        console.log(`[TrackingService] Route ${route.id} is already active, skipping startRoute emit`);
      }

      // 4. Update Store
      useTrackingStore.getState().setActiveRoute(route);
      useTrackingStore.getState().setTracking(true);

      // 5. Start Watching Position
      if (locationSubscription) {
        locationSubscription.remove();
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Every 5 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          
          // Update Store
          useTrackingStore.getState().updateLocation(latitude, longitude);

          // Emit to Socket
          socketService.updateLocation(latitude, longitude);
          console.log(`[TrackingService] Emitted location: ${latitude}, ${longitude}`);
        }
      );

      console.log(`[TrackingService] Started tracking for route: ${route.id}`);
    } catch (error: any) {
      console.error('[TrackingService] Error starting tracking:', error);
      useTrackingStore.getState().setError(error.message);
    }
  },

  async stopTracking() {
    try {
      const activeRoute = useTrackingStore.getState().activeRoute;
      
      if (activeRoute) {
        socketService.endRoute(activeRoute.id);
      }

      // Stop location updates
      if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
      }

      // Reset Store
      useTrackingStore.getState().reset();
      
      console.log('[TrackingService] Stopped tracking');
    } catch (error: any) {
      console.error('[TrackingService] Error stopping tracking:', error);
    }
  },

  getIsTracking() {
    return useTrackingStore.getState().isTracking;
  },

  getActiveRoute() {
    return useTrackingStore.getState().activeRoute;
  }
};
