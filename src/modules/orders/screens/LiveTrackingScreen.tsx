import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { goBack } from '@/navigation/navigationRef';
import MapView, { Marker, Polyline, Polygon } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { RouteProp, useRoute } from '@react-navigation/native';
import { VendorRouteDetails } from '../services/routeService';
import { socketService } from '@/services/socketService';
import { trackingService } from '@/services/TrackingService';
import { useTrackingStore } from '@/store/useTrackingStore';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Constants } from '@/config/constants';

type LiveTrackingParams = {
  LiveTracking: {
    routeData: VendorRouteDetails;
  };
};

export const LiveTrackingScreen = () => {
  const route = useRoute<RouteProp<LiveTrackingParams, 'LiveTracking'>>();
  const { routeData } = route.params;

  const storeLocation = useTrackingStore(state => state.currentLocation);
  const isTracking = useTrackingStore(state => state.isTracking);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (storeLocation) {
      setCurrentLocation(storeLocation);
      
      if (mapRef.current && isLive) {
        mapRef.current.animateToRegion({
          latitude: storeLocation.lat,
          longitude: storeLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  }, [storeLocation, isLive]);

  useEffect(() => {
    if (!isTracking || (trackingService.getActiveRoute()?.id !== routeData.id)) {
      trackingService.startTracking(routeData);
    }

    return () => {
      // NOTE: We NO LONGER disconnect the socket here.
      // The tracking continues in the background via TrackingService.
      console.log('[LiveTrackingScreen] Unmounting, tracking continues...');
    };
  }, [routeData.id]);

  const handleEndRoute = () => {
    Alert.alert(
      'End Route',
      'Are you sure you want to complete and end this route for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Route', 
          style: 'destructive',
          onPress: () => {
            setIsLive(false);
            if (!routeData.id) {
              Alert.alert('Error', 'Route ID is required to end the route');
              return;
            }
            trackingService.stopTracking();
            goBack();
          }
        }
      ]
    );
  };

  const getPolygons = () => {
    return null;
  };

  const getPath = () => {
    if (!routeData.routePath || routeData.routePath.length < 2) return null;
    const path = routeData.routePath;
    
    // Robust helper to handle both [lat, lng] array and {lat, lng} object
    const formatCoord = (p: any) => {
      if (!p) return null;
      const lat = Array.isArray(p) ? p[0] : (p.lat || p.latitude);
      const lng = Array.isArray(p) ? p[1] : (p.lng || p.longitude);
      if (typeof lat !== 'number' || typeof lng !== 'number') return null;
      return { latitude: lat, longitude: lng };
    };

    const origin = currentLocation 
      ? { latitude: currentLocation.lat, longitude: currentLocation.lng } 
      : formatCoord(path[0]);
      
    const destination = formatCoord(path[path.length - 1]);

    if (!origin || !destination) {
      console.warn('Invalid origin or destination for directions');
      return null;
    }

    // Convert routePath points to waypoints for MapViewDirections
    // If we have a currentLocation, we include the route's first point as the first waypoint.
    // If not, we start from the first point and only use intermediate waypoints.
    let waypoints: any[] | undefined = undefined;

    if (currentLocation) {
        // From current location -> path[0] -> path[1] ... -> path[last]
        waypoints = path.slice(0, -1).map(formatCoord).filter(c => c !== null);
    } else {
        // From path[0] -> path[1] ... -> path[last]
        waypoints = path.length > 2 
            ? path.slice(1, -1).map(formatCoord).filter(c => c !== null)
            : undefined;
    }

    console.log(`Directions Data: Origin [${!!origin}], Dest [${!!destination}], Waypoints [${waypoints?.length ?? 0}]`);

    return (
      <View>
        <Marker 
          coordinate={{ latitude: path[0][0], longitude: path[0][1] }} 
          pinColor="green" 
          title="Start" 
        />
        <Marker 
          coordinate={{ latitude: path[path.length-1][0], longitude: path[path.length-1][1] }} 
          pinColor="red" 
          title="End" 
        />
        
        <MapViewDirections
          origin={origin}
          destination={destination}
          waypoints={waypoints}
          apikey={Constants.GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor="#3B82F6" 
          optimizeWaypoints={true}
          onReady={(result) => {
            console.log(`Route Found: ${result.distance}km, ${result.duration}min`);
            if (!currentLocation) {
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { right: 50, bottom: 50, left: 50, top: 50 },
              });
            }
          }}
          onError={(errorMessage) => {
            console.warn('MapViewDirections Error: ' + errorMessage);
          }}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper scroll={false} backgroundColor="white">
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={false} 
        >
          {getPath()}
          {getPolygons()}

          {/* Current Location Marker representing the vendor */}
          {currentLocation && (
            <Marker coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.vendorMarkerWrapper}>
                <View style={styles.vendorMarkerRing}>
                  <View style={styles.vendorMarkerCore} />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Back Button Overlay */}
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111827" />
        </TouchableOpacity>

        {/* Route Info Header Overlay */}
        <View style={styles.topInfoCard}>
          <View style={styles.liveIndicatorRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE TRACKING</Text>
          </View>
          <Text style={styles.routeName} numberOfLines={1}>{routeData.name}</Text>
          <Text style={styles.routeDetailsText}>
             {routeData.startTime} - {routeData.endTime}
          </Text>
        </View>

        {/* Bottom Actions Overlay */}
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetContent}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons name="bicycle" size={24} color="#10B981" />
                <View>
                  <Text style={styles.statusLabel}>Status</Text>
                  <Text style={styles.statusValue}>Traveling</Text>
                </View>
              </View>
              
              <View style={styles.statusDivider} />
              
              <View style={styles.statusItem}>
                <Ionicons name="location" size={24} color="#3B82F6" />
                <View>
                  <Text style={styles.statusLabel}>Path Points</Text>
                  <Text style={styles.statusValue}>
                    {routeData.routePath ? routeData.routePath.length : 0}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.endRouteButton} onPress={handleEndRoute}>
              <Text style={styles.endRouteText}>End Route</Text>
              <Ionicons name="stop-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  topInfoCard: {
    position: 'absolute',
    top: 20,
    left: 80,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  routeDetailsText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetContent: {
    gap: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },
  endRouteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  endRouteText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  
  vendorMarkerWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorMarkerRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  vendorMarkerCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: 'white',
  },
});
