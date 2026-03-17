import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { theme } from '@theme/index';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { useOrderHistory } from '../hooks/useOrderHistory';
import pixelPerfect from '@/utils/pixelPerfect';
import { goBack } from '@/navigation/navigationRef';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    const normalized = status?.toLowerCase?.() || '';

    switch (normalized) {
      case 'delivered':
      case 'completed':
        return { bg: '#DEF7ED', text: '#10B981' };
      case 'pending':
      case 'created':
      case 'accepted':
      case 'preparing':
      case 'on_route':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'cancelled':
      case 'rejected':
        return { bg: '#FEE2E2', text: '#EF4444' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const styles = getStatusStyles();

  const formattedStatus = status
    ? status
        .toLowerCase()
        .split('_')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
    : '';

  return (
    <View style={[badgeStyles.container, { backgroundColor: styles.bg }]}>
      <Text style={[badgeStyles.text, { color: styles.text }]}>{formattedStatus}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: pixelPerfect(8),
    paddingVertical: pixelPerfect(4),
    borderRadius: pixelPerfect(8),
  },
  text: {
    fontSize: pixelPerfect(12),
    fontWeight: '700',
  },
});

export const OrderHistoryScreen = () => {
  const { orders, isLoading, refetch, isRefetching } = useOrderHistory();

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.vendorName}>{item.vendorName || 'Order'}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.metaSection}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Order ID</Text>
          <Text style={styles.metaValue}>{item.id}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Type</Text>
          <Text style={styles.metaValue}>
            {item.orderType === 'preorder' ? 'Preorder' : 'Instant'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Address</Text>
          <Text style={[styles.metaValue, styles.address]} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Location</Text>
          <Text style={styles.metaValue}>
            {item.locationLat?.toFixed(4)}, {item.locationLng?.toFixed(4)}
          </Text>
        </View>
      </View>

      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Subtotal</Text>
          <Text style={styles.amountValue}>₹{item.subtotal?.toFixed(2)}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Tax</Text>
          <Text style={styles.amountValue}>₹{item.taxAmount?.toFixed(2)}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{item.totalAmount?.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No orders found yet</Text>
              <Text style={styles.emptySubtext}>Your tea adventures will appear here!</Text>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
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
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: pixelPerfect(44),
    height: pixelPerfect(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: pixelPerfect(22),
  },
  backIcon: {
    fontSize: pixelPerfect(24),
    color: theme.colors.text.primary,
  },
  title: {
    ...theme.typography.subheader,
    fontSize: pixelPerfect(18),
    color: theme.colors.text.primary,
  },
  listContent: {
    padding: theme.spacing.m,
    paddingBottom: pixelPerfect(40),
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: pixelPerfect(16),
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.s,
  },
  vendorName: {
    fontSize: pixelPerfect(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  orderDate: {
    fontSize: pixelPerfect(12),
    color: theme.colors.text.secondary,
    marginTop: pixelPerfect(2),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.s,
  },
  itemsSection: {
    marginVertical: theme.spacing.xs,
  },
  metaSection: {
    marginVertical: theme.spacing.s,
    gap: pixelPerfect(4),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: pixelPerfect(2),
  },
  metaLabel: {
    fontSize: pixelPerfect(12),
    color: theme.colors.text.secondary,
  },
  metaValue: {
    fontSize: pixelPerfect(13),
    color: theme.colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  address: {
    maxWidth: '70%',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: pixelPerfect(4),
  },
  itemName: {
    fontSize: pixelPerfect(14),
    color: theme.colors.text.secondary,
  },
  itemPrice: {
    fontSize: pixelPerfect(14),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  amountSection: {
    marginTop: theme.spacing.s,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: pixelPerfect(2),
  },
  amountLabel: {
    fontSize: pixelPerfect(12),
    color: theme.colors.text.secondary,
  },
  amountValue: {
    fontSize: pixelPerfect(13),
    color: theme.colors.text.primary,
  },
  totalLabel: {
    fontSize: pixelPerfect(14),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  totalAmount: {
    fontSize: pixelPerfect(16),
    fontWeight: '800',
    color: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: pixelPerfect(100),
  },
  emptyEmoji: {
    fontSize: pixelPerfect(60),
    marginBottom: theme.spacing.m,
  },
  emptyText: {
    fontSize: pixelPerfect(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  emptySubtext: {
    fontSize: pixelPerfect(14),
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.s,
    textAlign: 'center',
  },
});
