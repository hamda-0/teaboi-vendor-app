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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is strictly required to track your route.');
        return;
      }

      socketService.connect();
      
      const currentActiveRoute = useTrackingStore.getState().activeRoute;
      const isCurrentlyTracking = useTrackingStore.getState().isTracking;

      // Only emit startRoute if we aren't already tracking THIS route
      if (!isCurrentlyTracking || currentActiveRoute?.id !== route.id) {
        if (route.status?.toUpperCase() !== 'ACTIVE') {
          socketService.startRoute(route.id);
        } else {
          console.log(`[TrackingService] Route ${route.id} is already active on server, skipping startRoute emit`);
        }
      } else if (isCurrentlyTracking && currentActiveRoute?.id === route.id) {
        console.log(`[TrackingService] Already tracking route ${route.id}, skipping redundant start logic`);
        return; 
      }

      // 4. Update Store
      useTrackingStore.getState().setActiveRoute(route);
      useTrackingStore.getState().setTracking(true);

      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      useTrackingStore.getState().updateLocation(initialLocation.coords.latitude, initialLocation.coords.longitude);

      // 5. Start Watching Position
      if (locationSubscription) {
        locationSubscription.remove();
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10, 
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          
          // Update 
          useTrackingStore.getState().updateLocation(latitude, longitude);

          // Emit
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
      if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
      }
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
