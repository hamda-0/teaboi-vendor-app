import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Dimensions, Alert } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import { useAuthStore } from '@store/useAuthStore';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useNotificationStore } from '@/store/useNotificationStore';

const { width } = Dimensions.get('window');

const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const BellIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 01-3.46 0" />
    <Circle cx="19" cy="7" r="3" fill="#EF4444" stroke="white" strokeWidth="1.5" />
  </Svg>
);

const PinIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

const ClockIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

const RouteIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 3C4.24 3 2 5.24 2 8c0 2.21 1.79 4 4 4h12c2.21 0 4 1.79 4 4 0 2.76-2.24 5-5 5" />
    <Circle cx="7" cy="3" r="1.5" fill={theme.colors.primary} />
    <Circle cx="17" cy="21" r="1.5" fill={theme.colors.primary} />
  </Svg>
);

const ShoppingBasketIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4Z" />
    <Path d="M3 6h18" />
    <Path d="M16 10a4 4 0 01-8 0" />
  </Svg>
);

export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const user = useAuthStore(state => state.user);
  // todo remove after ui updates
  const { expoPushToken, notification, error } = useNotificationStore();
  if(error){
    console.log(error);
    //     return (
    //   <View style={styles.mainContainer}>
    //     <ScreenWrapper style={styles.screenWrapper} scroll={false}>
    //       <Text>Error: {error.message}</Text>
    //     </ScreenWrapper>
    //   </View>
    // );
  }
  console.log(JSON.stringify(notification,null,2));
  console.log("expoPushToken:",expoPushToken);
  
  
  return (
    <View style={styles.mainContainer}>
      <ScreenWrapper style={styles.screenWrapper} scroll={false}>
        {/* Map Background Simulation */}
        <View style={styles.mapBackground}>
          {/* Mock Map Streets and Park */}
          <View style={[styles.mapStreet, { top: '30%', height: 40, width: '120%', transform: [{ rotate: '-15deg' }] }]} />
          <View style={[styles.mapStreet, { top: '60%', height: 40, width: '120%', transform: [{ rotate: '20deg' }] }]} />
          <View style={[styles.mapStreet, { left: '40%', width: 40, height: '120%', transform: [{ rotate: '5deg' }] }]} />
          <View style={styles.mapParkSmall} />
          
          {/* Map Markers */}
          <View style={[styles.markerContainer, { top: '40%', left: '35%' }]}>
            <View style={styles.markerCircle}>
              <Text style={styles.markerEmoji}>🍵</Text>
            </View>
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>Tea Boy Rahul (3m)</Text>
            </View>
          </View>
          <View style={[styles.locationDot, { top: '55%', left: '50%' }]} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Custom Header */}
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.profileCircle}>
                 <Text style={{ fontSize: 30 }}>👨🏻‍💼</Text>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>GOOD MORNING</Text>
                <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <BellIcon />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tea varieties or vendors..."
              placeholderTextColor={theme.colors.text.placeholder}
            />
          </View>

          <View style={{ height: 120 }} />

          {/* Vendor Nearby Card Overlay */}
          <View style={styles.nearbyCard}>
             <View style={styles.nearbyIconContainer}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <Path d="M21 3L3 10.5L11.25 12.75L13.5 21L21 3Z" />
                </Svg>
             </View>
             <View style={styles.nearbyContent}>
                <Text style={styles.nearbyTitle}>Vendor Nearby!</Text>
                <Text style={styles.nearbySubtitle}>Tea Boy Rahul is just 100m away on your route.</Text>
             </View>
             <TouchableOpacity style={styles.orderButtonSmall}>
                <Text style={styles.orderButtonSmallText}>Order</Text>
             </TouchableOpacity>
          </View>
          <Text style={styles.markerEmoji}>{JSON.stringify(notification?.request.content.data,null,2)}</Text>
            
          {/* Nearby Vendors Section */}
          <View style={styles.whiteSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Vendors</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>SEE ALL</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
               horizontal 
               showsHorizontalScrollIndicator={false}
               style={styles.vendorScroll}
               contentContainerStyle={styles.vendorScrollContent}
            >
              <TouchableOpacity style={styles.vendorCard}>
                <View style={styles.vendorImagePlaceholder}>
                  <Text style={{ fontSize: 40 }}>🏪</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ 4.8</Text>
                  </View>
                </View>
                <Text style={styles.vendorName}>Rahul's Tea Stall</Text>
                <View style={styles.vendorInfoRow}>
                  <ClockIcon />
                  <Text style={styles.vendorInfoText}>3 min</Text>
                  <View style={styles.dot} />
                  <PinIcon />
                  <Text style={styles.vendorInfoText}>200m</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.vendorCard}>
                <View style={styles.vendorImagePlaceholder}>
                  <Text style={{ fontSize: 40 }}>🧉</Text>
                </View>
                <Text style={styles.vendorName}>Authentic Chai</Text>
                <View style={styles.vendorInfoRow}>
                  <ClockIcon />
                  <Text style={styles.vendorInfoText}>8 min</Text>
                  <View style={styles.dot} />
                  <PinIcon />
                  <Text style={styles.vendorInfoText}>1.2km</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Coming Your Way */}
            <View style={styles.comingYourWayContainer}>
               <View style={styles.comingHeader}>
                 <RouteIcon />
                 <Text style={styles.comingTitle}>Coming Your Way</Text>
               </View>

               <View style={styles.timeline}>
                 <View style={styles.timelineItem}>
                   <View style={styles.timelineMarkerContainer}>
                     <View style={[styles.timelineDot, { backgroundColor: theme.colors.primary }]} />
                     <View style={styles.timelineLine} />
                   </View>
                   <View style={styles.timelineContent}>
                     <Text style={styles.arrivalText}>9:00 AM ARRIVAL</Text>
                     <Text style={styles.routeName}>Main St Route (Tea Boy Rahul)</Text>
                     <Text style={styles.routeDetail}>Passing by your current location office area.</Text>
                   </View>
                 </View>

                 <View style={styles.timelineItem}>
                   <View style={styles.timelineMarkerContainer}>
                     <View style={[styles.timelineDot, { backgroundColor: '#CBD5E1' }]} />
                   </View>
                   <View style={styles.timelineContent}>
                     <Text style={[styles.arrivalText, { color: '#64748B' }]}>11:15 AM ARRIVAL</Text>
                     <Text style={styles.routeName}>East Plaza Loop</Text>
                     <Text style={styles.routeDetail}>Planned stop at Community Hub.</Text>
                   </View>
                 </View>
               </View>
            </View>
          </View>
        </ScrollView>
      </ScreenWrapper>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <ShoppingBasketIcon />
        <Text style={styles.fabText}>Order Now</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenWrapper: {
    padding: 0,
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 450,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mapStreet: {
    position: 'absolute',
    backgroundColor: '#F1F5F9',
  },
  mapParkSmall: {
    position: 'absolute',
    top: '35%',
    right: '10%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DCFCE7',
  },
  locationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.secondary,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    position: 'absolute',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerLabel: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 40,
    minWidth: 180,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DEF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  nearbyCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  nearbyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyContent: {
    flex: 1,
    marginLeft: 12,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
  },
  nearbySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  orderButtonSmall: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  orderButtonSmallText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  whiteSection: {
    backgroundColor: 'white',
    marginTop: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 30,
    paddingHorizontal: 20,
    minHeight: 500,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  vendorScroll: {
    marginHorizontal: -20,
  },
  vendorScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  vendorCard: {
    width: width * 0.45,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  vendorImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  vendorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorInfoText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  comingYourWayContainer: {
    marginTop: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
  },
  comingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  timeline: {
    marginLeft: 5,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarkerContainer: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 15,
  },
  arrivalText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  routeDetail: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 8,
  },
});


