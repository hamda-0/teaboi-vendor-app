import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@theme/index';
import { goBack } from '@/navigation/navigationRef';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';

export const OrderDetailScreen = ({ route }: { route: any }) => {
  const { orderId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['orderDetails', orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
  });

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const order = data?.data;

  const handleUpdateStatus = (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateStatus({ id: orderId, status: newStatus }) }
      ]
    );
  };

  const getStatusActions = () => {
    if (!order) return null;
    
    switch (order.status.toLowerCase()) {
      case 'created':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]} 
              onPress={() => handleUpdateStatus('rejected')}
              disabled={isPending}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]} 
              onPress={() => handleUpdateStatus('accepted')}
              disabled={isPending}
            >
              <Text style={styles.acceptText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={() => handleUpdateStatus('preparing')}
            disabled={isPending}
          >
            <Text style={styles.primaryButtonText}>Start Preparing</Text>
          </TouchableOpacity>
        );
      case 'preparing':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={() => handleUpdateStatus('on_route')}
            disabled={isPending}
          >
            <Text style={styles.primaryButtonText}>Ready for Pickup</Text>
          </TouchableOpacity>
        );
      case 'on_route':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={() => handleUpdateStatus('delivered')}
            disabled={isPending}
          >
            <Text style={styles.primaryButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.completedText}>Order {order.status}</Text>
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text>Order details not found.</Text>
        <TouchableOpacity onPress={() => goBack()}>
          <Text style={{ color: theme.colors.primary, marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>#{order.id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Placed At</Text>
            <Text style={styles.value}>{new Date(order.createdAt).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.badge}>{order.orderType.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.card}>
          {order.items?.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
               <View style={styles.itemInfo}>
                 <Text style={styles.itemName}>{item.name}</Text>
                 <Text style={styles.itemQty}>x{item.quantity}</Text>
               </View>
               <Text style={styles.itemPrice}>Rs {item.price * item.quantity}</Text>
            </View>
          )) || <Text style={styles.emptyItems}>No items specified</Text>}
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.amount}>Rs {order.subtotal}</Text>
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs {order.totalAmount}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Delivery Location</Text>
        <View style={styles.card}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <Text style={styles.locationText}>{order.address || 'Loading address...'}</Text>
          </View>
        </View>

      </ScrollView>

      <View style={styles.footerAction}>
        {getStatusActions()}
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  itemQty: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  amount: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  footerAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
  },
  rejectButton: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  acceptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  rejectText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyItems: {
    textAlign: 'center',
    color: theme.colors.grey,
    paddingVertical: 10,
  }
});
