import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { goBack } from '@/navigation/navigationRef';
import MapView, { Marker, Polyline, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { RoutePoint } from '../services/routeService';
import { RouteProp, useRoute } from '@react-navigation/native';

type SelectionMode = 'route' | 'zone';
type MapPickerParams = {
  MapPicker: {
    onGoBack: (data: { selectedPath: RoutePoint[]; selectedZone: RoutePoint[] }) => void;
  };
};
export const MapPickerScreen = () => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('route');
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [zonePoints, setZonePoints] = useState<RoutePoint[]>([]);
  
  const [region, setRegion] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);
const route = useRoute<RouteProp<MapPickerParams, 'MapPicker'>>();


  const handleMapPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    const point = { lat: coords.latitude, lng: coords.longitude };
    
    if (selectionMode === 'route') {
      if (!startPoint) {
        setStartPoint(point);
      } else if (!endPoint) {
        setEndPoint(point);
      } else {
        setStartPoint(point);
        setEndPoint(null);
      }
    } else {
      setZonePoints([...zonePoints, point]);
    }
  };

// Replace handleConfirm with this:
const handleConfirm = () => {
  if (!startPoint || !endPoint) {
    Alert.alert('Incomplete Path', 'Please select both start and end points for your route.');
    return;
  }
  if (zonePoints.length < 3) {
    Alert.alert('Incomplete Zone', 'Please define at least 3 points for your service zone.');
    return;
  }

  route.params.onGoBack({
    selectedPath: [startPoint, endPoint],
    selectedZone: zonePoints,
  });

  goBack();
}
  return (
    <ScreenWrapper scroll={false} backgroundColor="white">
      {/* Full screen Map */}
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
        >
          {/* Path */}
          {startPoint && <Marker coordinate={{ latitude: startPoint.lat, longitude: startPoint.lng }} pinColor="green" title="Start" />}
          {endPoint && <Marker coordinate={{ latitude: endPoint.lat, longitude: endPoint.lng }} pinColor="red" title="End" />}
          {startPoint && endPoint && (
            <Polyline coordinates={[{ latitude: startPoint.lat, longitude: startPoint.lng }, { latitude: endPoint.lat, longitude: endPoint.lng }]} strokeColor="#22C55E" strokeWidth={4} />
          )}

          {/* Zone */}
          {zonePoints.map((p, i) => (
            <Marker key={`z-${i}`} coordinate={{ latitude: p.lat, longitude: p.lng }} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.dot} />
            </Marker>
          ))}
          {zonePoints.length > 0 && (
            <Polygon coordinates={zonePoints.map(p => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#3B82F6" fillColor="rgba(59, 130, 246, 0.3)" strokeWidth={2} />
          )}
        </MapView>

        {/* Back Button Overlay */}
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111827" />
        </TouchableOpacity>

        {/* Mode & Instructions */}
        <View style={styles.overlayTop}>
          <View style={styles.modeToggle}>
            <TouchableOpacity 
              onPress={() => setSelectionMode('route')}
              style={[styles.modeButton, selectionMode === 'route' && styles.activeModeButton]}
            >
              <Text style={[styles.modeText, selectionMode === 'route' && styles.activeModeText]}>PATH</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setSelectionMode('zone')}
              style={[styles.modeButton, selectionMode === 'zone' && styles.activeModeButton]}
            >
              <Text style={[styles.modeText, selectionMode === 'zone' && styles.activeModeText]}>ZONE</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              {selectionMode === 'route' 
                ? (!startPoint ? 'Tap to select Start' : !endPoint ? 'Tap to select End' : 'Path selected!')
                : (zonePoints.length < 3 ? `Tap to define Zone bounds (${zonePoints.length}/3)` : 'Zone complete!')}
            </Text>
          </View>
        </View>

        {/* Actions Overlay */}
        <View style={styles.overlayBottom}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={() => {
              if (selectionMode ==='route') { setStartPoint(null); setEndPoint(null); }
              else setZonePoints([]);
            }}
          >
            <Ionicons name="refresh-outline" size={24} color="#6B7280" />
            <Text style={styles.resetText}>Clear {selectionMode.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Selection</Text>
          </TouchableOpacity>
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
  },
  overlayTop: {
    position: 'absolute',
    top: 20,
    left: 80,
    right: 20,
    gap: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 26,
  },
  activeModeButton: {
    backgroundColor: '#22C55E',
  },
  modeText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#6B7280',
  },
  activeModeText: {
    color: 'white',
  },
  instructionCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  resetText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: 'white',
  },
});
