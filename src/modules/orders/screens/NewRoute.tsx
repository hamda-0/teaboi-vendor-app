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
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import pixelPerfect from '@/utils/pixelPerfect';
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
import { useMapStore } from '@/store/useMapStore';

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
  const setTempData = useMapStore(state => state.setTempData);
  const route = useRoute<RouteProp<RootStackParamList, 'CreateRoute'>>();
  const [routeName, setRouteName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:00');
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
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

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setEndTime(`${hours}:${minutes}`);
    }
  };

  const getPickerDate = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
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
          <Text style={styles.label}>Execution Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeSubLabel}>Start</Text>
              <TouchableOpacity 
                style={styles.timeInputContainer} 
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeInputText}>{startTime || '08:00'}</Text>
                <Ionicons name="time-outline" size={pixelPerfect(20)} color="#22C55E" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeColumn}>
              <Text style={styles.timeSubLabel}>End</Text>
              <TouchableOpacity 
                style={styles.timeInputContainer} 
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeInputText}>{endTime || '11:00'}</Text>
                <Ionicons name="time-outline" size={pixelPerfect(20)} color="#22C55E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker Modal (Bottom Sheet style for iOS) */}
          <Modal
            transparent={true}
            visible={showStartTimePicker || showEndTimePicker}
            animationType="fade"
            onRequestClose={() => {
              setShowStartTimePicker(false);
              setShowEndTimePicker(false);
            }}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => {
                setShowStartTimePicker(false);
                setShowEndTimePicker(false);
              }}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select {showStartTimePicker ? 'Start' : 'End'} Time
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowStartTimePicker(false);
                      setShowEndTimePicker(false);
                    }}
                  >
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={getPickerDate(showStartTimePicker ? startTime : endTime)}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={showStartTimePicker ? onStartTimeChange : onEndTimeChange}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Geographic Path / Map Button */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Geographic Path</Text>
          
          <TouchableOpacity 
            style={styles.mapPickerButton} 
            activeOpacity={0.7}
           
              
              onPress={() => {
                setTempData({
                  onGoBack: (data: { selectedPath: RoutePoint[] }) => {
                    setStartPoint(data.selectedPath[0]);
                    setEndPoint(data.selectedPath[1]);
                  }
                });
                navigate('MapPicker', {
                  initialStartPoint: startPoint,
                  initialEndPoint: endPoint,
                });
              }}
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
    gap: pixelPerfect(16),
  },
  timeColumn: {
    flex: 1,
    gap: pixelPerfect(6),
  },
  timeSubLabel: {
    fontSize: pixelPerfect(13),
    color: '#64748B',
    fontWeight: '600',
    marginLeft: pixelPerfect(4),
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: pixelPerfect(14),
    paddingHorizontal: pixelPerfect(16),
    height: pixelPerfect(54),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeInputText: {
    fontSize: pixelPerfect(16),
    color: '#1E293B',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: pixelPerfect(24),
    borderTopRightRadius: pixelPerfect(24),
    paddingBottom: pixelPerfect(40),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: pixelPerfect(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: pixelPerfect(17),
    fontWeight: '700',
    color: '#0F172A',
  },
  doneText: {
    fontSize: pixelPerfect(16),
    color: '#22C55E',
    fontWeight: '700',
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