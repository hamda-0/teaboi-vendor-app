import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { goBack } from '@/navigation/navigationRef';
import MapView, { Marker, Polyline, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { routeService, RoutePoint, VendorRouteDetails } from '../services/routeService';
import { useUpdateRoute } from '../hooks/useUpdateRoute';
import { useRoute, RouteProp } from '@react-navigation/native';
import { navigate } from '@/navigation/navigationRef';
import { useQuery } from '@tanstack/react-query';

type RootStackParamList = {
  CreateRoute: { 
    editingRoute?: VendorRouteDetails;
  };
  MapPicker: {
    initialStartPoint?: RoutePoint | null;
    initialEndPoint?: RoutePoint | null;
    onGoBack: (data: { selectedPath: RoutePoint[] }) => void;
  };
};
export const NewRouteScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CreateRoute'>>();
  const [routeName, setRouteName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:00');
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  
  const { mutateAsync: updateRoute } = useUpdateRoute();
  const editingId = route.params?.editingRoute?.id;
  const isEditing = !!editingId;

  const { data: routeDetails, isLoading: isFetchingDetails } = useQuery({
    queryKey: ['routeDetails', editingId],
    queryFn: () => routeService.getRouteDetails(editingId!),
    enabled: isEditing && !!editingId,
  });

  useEffect(() => {
    if (routeDetails?.error || (routeDetails?.statusCode && routeDetails.statusCode >= 400)) {
      Alert.alert(
        'Error', 
        typeof routeDetails.error === 'string' ? routeDetails.error : 'Failed to fetch route details'
      );
      return;
    }

    const details = routeDetails?.data?.data;
    if (details) {
      // console.log('Populating form with fetched details data:', details);
      setRouteName(details.name);
      setStartTime(details.startTime);
      setEndTime(details.endTime);
      
      const path = details.routePath;
      if (path && Array.isArray(path) && path.length >= 2) {
        // Transform [lat, lng] array to {lat, lng} object
        const p1 = Array.isArray(path[0]) ? { lat: path[0][0], lng: path[0][1] } : path[0];
        const p2 = Array.isArray(path[1]) ? { lat: path[1][0], lng: path[1][1] } : path[1];
        setStartPoint(p1 as RoutePoint);
        setEndPoint(p2 as RoutePoint);
        // console.log('Mapped StartPoint:', p1);
      }
    }
  }, [routeDetails]);

  const resetSelection = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRouteName('');
  };

  const handleSave = async () => {
    if (!routeName) {
      Alert.alert('Error', 'Please enter a route name');
      return;
    }
    if (!startPoint || !endPoint) {
      Alert.alert('Error', 'Please select both start and end points for the route path');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: routeName,
        startTime,
        endTime,
        routePath: [startPoint, endPoint],
      };

      if (isEditing && editingId) {
        await updateRoute({ id: editingId, data: payload });
        goBack();
      } else {
        await routeService.createRoute(payload as any);
        Alert.alert('Success', 'Route created successfully', [
          { text: 'OK', onPress: () => goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('Error saving route:', error);
      Alert.alert('Error', error.message || 'Failed to save route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll keyboardAvoiding backgroundColor="#F9FAFB">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{isEditing ? 'Edit Route' : 'Create New Route'}</Text>

        <TouchableOpacity onPress={resetSelection}>
          <Text style={styles.resetText}>{isEditing ? '' : 'Reset'}</Text>
        </TouchableOpacity>
      </View>

      {isFetchingDetails ? (
        <View style={{ flex: 1, padding: 50, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={{ marginTop: 16 }}>Loading route details...</Text>
        </View>
      ) : (
        <View style={styles.content}>
        {/* Route Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Route Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Morning Downtown Loop"
            placeholderTextColor="#9CA3AF"
            value={routeName}
            onChangeText={setRouteName}
          />
        </View>

        {/* Start & End Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time      End Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="08:00"
              />
              <TouchableOpacity>
                <Ionicons name="time-outline" size={22} color="#22C55E" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="11:00"
              />
              <TouchableOpacity>
                <Ionicons name="time-outline" size={22} color="#22C55E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Geographic Path / Map Button */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Geographic Path</Text>
          
          <TouchableOpacity 
            style={styles.mapPickerButton} 
            activeOpacity={0.7}
           
              
              onPress={() => navigate('MapPicker', {
  initialStartPoint: startPoint,
  initialEndPoint: endPoint,
  onGoBack: (data: { selectedPath: RoutePoint[] }) => {
    setStartPoint(data.selectedPath[0]);
    setEndPoint(data.selectedPath[1]);
  }
})}
          >
            <View style={styles.mapIconContainer}>
              <Ionicons name="map-outline" size={28} color="#22C55E" />
            </View>
            <View style={styles.mapTextContainer}>
              <Text style={styles.mapPickerTitle}>
                {startPoint && endPoint ? 'Location Selected' : 'Select on Map'}
              </Text>
              <Text style={styles.mapPickerSub}>
                {startPoint && endPoint 
                  ? `Path defined` 
                  : 'Tap to open full-screen map picker'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {startPoint && (
            <View style={styles.selectionSummary}>
              <View style={styles.summaryItem}>
                <Ionicons name="navigate-circle" size={16} color={"#22C55E"} />
                <Text style={styles.summaryText}>
                  Path: {startPoint?.lat?.toFixed(4)}, {startPoint?.lng?.toFixed(4)}
                  {endPoint ? ` → ${endPoint?.lat?.toFixed(4)}, ${endPoint?.lng?.toFixed(4)}` : ''}
                </Text>
              </View>
            </View>
          )}
        </View>


        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{isEditing ? 'Update Route' : 'Save New Route'}</Text>
          )}
        </TouchableOpacity>
      </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#64748B" />
          <Text style={styles.navLabel}>HOME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="git-network-outline" size={24} color="#22C55E" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>ROUTES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="list-outline" size={24} color="#64748B" />
          <Text style={styles.navLabel}>ORDERS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#64748B" />
          <Text style={styles.navLabel}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  resetText: {
    color: '#22C55E',
    fontWeight: '600',
    fontSize: 15,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 140, 
  },

  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 14,
  },

  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectZones: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 14,
  },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mapInstruction: {
    fontSize: 14,
    color: '#4B5563',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    textAlign: 'center',
    overflow: 'hidden',
  },
  
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  repeatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  repeatTextContainer: {
    flex: 1,
  },
  repeatLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  repeatDays: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  saveButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navItemActive: {},
  navLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#22C55E',
    fontWeight: '700',
  },
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
  },
  mapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mapTextContainer: {
    flex: 1,
  },
  mapPickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  mapPickerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  selectionSummary: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
});