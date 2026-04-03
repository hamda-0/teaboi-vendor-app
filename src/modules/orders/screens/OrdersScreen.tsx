import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveOrders } from '../hooks/useActiveOrders';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { theme } from '@theme/index';
import { navigate, goBack } from '@/navigation/navigationRef';
import { Order } from '../services/orderService';

import { useOrdersLogic, TabType } from '../hooks/useOrdersLogic';

export const OrdersScreen = () => {
  const {
    activeTab,
    setActiveTab,
    orders,
    isLoading,
    isRefetching,
    refetch,
    error,
    navigateToDetail,
    getStatusColor,
  } = useOrdersLogic();

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigateToDetail(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase().replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{item.address || 'User Address'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>Rs {item.totalAmount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Orders</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' ? null : styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSubtitle}>Could not load your orders at the moment.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="receipt-outline" size={64} color={theme.colors.grey} />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderBody: {
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.grey,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: 'white',
    fontWeight: '700',
  },
});
