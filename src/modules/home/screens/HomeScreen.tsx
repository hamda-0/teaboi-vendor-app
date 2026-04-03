import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Switch,           // ← built-in toggle switch
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '@shared/components/ScreenWrapper'; // assuming you still use this
import { theme } from '@theme/index'; // assuming you have theme
import { useAuthStore } from '@store/useAuthStore';
import { colors } from '@/theme/colors';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const user = useAuthStore((state) => state.user);

  // Toggle state – in real app, load/save this from your store / backend
  const [isOnline, setIsOnline] = useState(true);

  // Mock data
  const upcomingOrders = [
    { id: '1', time: '10:15', title: 'Morning Brew x 4', place: 'Suite 402, Neo Plaza' },
    { id: '2', time: '10:30', title: 'Ginger Tea x 2', place: 'Reception, Sky Tower' },
    { id: '3', time: '10:45', title: 'Masala Chai x 6', place: 'Floor 12, Capital One' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} >
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <View>
            <Text style={styles.brand}>TEABOI</Text>
            <Text style={styles.subBrand}>VENDOR DASHBOARD</Text>
          </View>
        </View>

        {/* Modern toggle switch for Online/Offline */}
        <View style={styles.onlineToggleContainer}>
          <Text style={[
            styles.onlineStatusText,
            isOnline ? styles.onlineText : styles.offlineText
          ]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#d1d5db', true: colors.primaryDark }}
            thumbColor={isOnline ? colors.background: '#6b7280'}
            ios_backgroundColor="#d1d5db"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Route Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>ACTIVE ROUTE</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>

          <Text style={styles.routeTitle}>Downtown Tech Hub Express</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
            <Text style={styles.progressLabel}>8 of 12 deliveries • 66%</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Today's Earnings</Text>
              <Text style={styles.statValue}>
                $248 <Text style={styles.green}>+$42</Text>
              </Text>
              <Text style={styles.statSub}>Updated 2m ago</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Orders Completed</Text>
              <Text style={styles.statValue}>
                32 <Text style={styles.gray}>/45 target</Text>
              </Text>
              <Text style={styles.statSub}>Top 5% today</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {upcomingOrders.map((order, index) => (
          <TouchableOpacity
            key={index}
            style={styles.orderCard}
            activeOpacity={0.75}
            onPress={() => {
              navigation.navigate('OrderDetail', { orderId: order.id || index.toString() });
            }}
          >
            <View style={styles.timeWindow}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.timeText}>{order.time}</Text>
            </View>

            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>{order.title}</Text>
              <View style={styles.placeRow}>
                <Ionicons name="location-outline" size={14} color="#9ca3af" />
                <Text style={styles.orderPlace}>{order.place}</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom tab bar completely removed – no replacement added */}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40, // reduced bottom padding since no tab bar
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.4,
  },
  subBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },

  // ── Online/Offline Toggle ──────────────────────────────
  onlineToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  onlineStatusText: {
    fontSize: 15,
    fontWeight: '700',
  },
  onlineText: {
    color: '#16a34a',
  },
  offlineText: {
    color: '#ef4444',
  },


  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  routeTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  statSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  green: {
    color: '#16a34a',
    fontSize: 15,
  },
  gray: {
    color: '#94a3b8',
    fontSize: 15,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  viewAll: {
    color: '#22c55e',
    fontWeight: '700',
    fontSize: 14,
  },

  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  timeWindow: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderPlace: {
    fontSize: 14,
    color: '#64748b',
  },
});