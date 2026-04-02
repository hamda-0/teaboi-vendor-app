import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { goBack, navigate } from '@/navigation/navigationRef';
import { useVendorRoutes } from '../hooks/useVendorRoutes';
import { useCancelRoute } from '../hooks/useCancelRoute';
import { ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { VendorRouteDetails } from '../services/routeService';
import { socketService } from '@/services/socketService';



export const RoutesScreen = () => {
  const { routes, isLoading, refetch, isRefetching, meta } = useVendorRoutes();
  const { mutate: cancelRoute, isPending: isCancelling } = useCancelRoute();

  const getStatusStyle = (status: string = 'PLANNED') => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { bg: '#FEF3C7', text: '#B45309', label: 'ACTIVE' };
      case 'APPROVED':
        return { bg: '#DCFCE7', text: '#166534', label: 'APPROVED' };
      case 'PLANNED':
        return { bg: '#E0F2FE', text: '#1E40AF', label: 'PLANNED' };
      case 'REJECT':
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#991B1B', label: 'REJECTED' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status?.toUpperCase() || 'UNKNOWN' };
    }
  };

  const handleEditPress = (route: VendorRouteDetails) => {
    const status = route.status?.toUpperCase() || '';
    const canEdit = ['PLANNED', 'REJECT', 'REJECTED'].includes(status);
    
    if (!canEdit) {
      Alert.alert(
        'Cannot Edit', 
        `Only planned or rejected routes can be edited. Current status is ${status}.`
      );
      return;
    }

    navigate('CreateRoute', { editingRoute: route });
  };

  const handleCancelPress = (route: VendorRouteDetails) => {
    const status = route.status?.toUpperCase() || '';
    const canCancel = ['PLANNED', 'APPROVED'].includes(status);
    
    if (!canCancel) {
      Alert.alert(
        'Cannot Cancel', 
        `Only planned or approved routes can be cancelled. Current status is ${status}.`
      );
      return;
    }

    const routeId = route.id;
    if (!routeId) {
      Alert.alert('Error', 'Invalid route ID');
      return;
    }

    Alert.alert(
      'Cancel Route',
      `Are you sure you want to cancel "${route.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'destructive',
          onPress: () => cancelRoute(routeId)
        }
      ]
    );
  };

  const formatTime = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 'Time not set';
    return `${startTime} - ${endTime}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={()=>goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Routes</Text>

        <View style={styles.headerRight}>
          {/* <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.optimizationText}>Optimization</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22C55E" />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Saved Routes</Text>
          <Text style={styles.countText}>{meta?.total || routes.length} TOTAL</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>Fetching your routes...</Text>
          </View>
        ) : routes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Routes Found</Text>
            <Text style={styles.emptySubtitle}>
              You haven't created any routes yet. Create your first route to start selling!
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => navigate('CreateRoute')}
            >
              <Text style={styles.createFirstButtonText}>Create First Route</Text>
            </TouchableOpacity>
          </View>
        ) : (
          routes.map((route: VendorRouteDetails, index: number) => {
            const statusStyle = getStatusStyle(route.status);
            const timeRange = formatTime(route.startTime, route.endTime);
            const stopsCount = route.routeZones?.length || 0;
            const distance = null;
            const routeId = route.id || `route-${index}`;

             return (
              <View key={routeId} style={styles.routeCard}>
                <View style={styles.cardInfoSection}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.routeName} numberOfLines={1}>{route.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color="#22C55E" />
                      <Text style={styles.detailText}>{timeRange}</Text>
                    </View>
                    {(distance || stopsCount > 0) && (
                      <View style={styles.detailItem}>
                        <Ionicons name="map" size={16} color="#3B82F6" />
                        <Text style={styles.detailText}>
                          {distance ? `${distance}` : ''}
                          {distance && stopsCount > 0 ? ' • ' : ''}
                          {stopsCount > 0 ? `${stopsCount} stops` : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Actions Section */}
                <View style={styles.actionsDivider} />
                <View style={styles.actionsRow}>
                  {route.status?.toUpperCase() === 'APPROVED' || route.status?.toUpperCase() === 'INCOMPLETE' || route.status?.toUpperCase() === 'ACTIVE' ? (
                    <TouchableOpacity
                    onPress={() => {
                      // console.log('Starting route:', route.name);
                      socketService.connect();
                      socketService.startRoute(route.id)
                      navigate('LiveTracking', { routeData: route });
                      // socketService.subscribeRoute(route._id || route.id);
                      // Alert.alert('Route Started', `Connected to route: ${route.name}`);
                      // Here you can navigate to the Live Tracking map screen
                    }}
                    style={[styles.premiumButton, styles.startButton]}>
                      <Ionicons name={route.status?.toUpperCase() === 'ACTIVE' ? "map" : "play"} size={18} color="white" />
                      <Text style={styles.premiumButtonText}>
                        {route.status?.toUpperCase() === 'ACTIVE' ? "Live Tracking" : "Start Today's Route"}
                      </Text>
                    </TouchableOpacity>
                  ) : ['PLANNED', 'REJECT', 'REJECTED'].includes(route.status?.toUpperCase() || '') ? (
                    <TouchableOpacity 
                      style={[styles.premiumButton, styles.editMainButton]}
                      onPress={() => handleEditPress(route)}
                    >
                      <Ionicons name="pencil" size={18} color="#065F46" />
                      <Text style={[styles.premiumButtonText, { color: '#065F46' }]}>Edit Route</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity 
                    style={styles.cancelIconButton} 
                    onPress={() => handleCancelPress(route)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={()=>navigate('CreateRoute')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // optimizationText: {
  //   color: '#22C55E',
  //   fontWeight: '600',
  //   fontSize: 15,
  // },
  helpButton: {
    padding: 4,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  countText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  routeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardInfoSection: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDetails: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  actionsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  premiumButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  viewButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editMainButton: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  premiumButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  cancelIconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    // optional: you can add background or scale if you want
  },
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  createFirstButton: {
    marginTop: 24,
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});