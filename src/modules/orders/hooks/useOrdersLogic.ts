import { useState } from 'react';
import { useActiveOrders } from '../hooks/useActiveOrders';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { navigate } from '@/navigation/navigationRef';

export type TabType = 'active' | 'history';

export const useOrdersLogic = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const {
    orders: activeOrders,
    isLoading: isLoadingActive,
    error: errorActive,
    refetch: refetchActive,
    isRefetching: isRefetchingActive,
  } = useActiveOrders();

  const {
    orders: historyOrders,
    isLoading: isLoadingHistory,
    error: errorHistory,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = useOrderHistory();

  const orders = activeTab === 'active' ? activeOrders : historyOrders;
  const isLoading = activeTab === 'active' ? isLoadingActive : isLoadingHistory;
  const isRefetching = activeTab === 'active' ? isRefetchingActive : isRefetchingHistory;
  const refetch = activeTab === 'active' ? refetchActive : refetchHistory;
  const error = activeTab === 'active' ? errorActive : errorHistory;

  const navigateToDetail = (orderId: string) => {
    navigate('OrderDetail', { orderId });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created': return '#3B82F6';
      case 'accepted': return '#F59E0B';
      case 'preparing': return '#8B5CF6';
      case 'on_route': return '#10B981';
      case 'delivered': return '#10B981';
      case 'rejected':
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return {
    activeTab,
    setActiveTab,
    orders,
    isLoading,
    isRefetching,
    refetch,
    error,
    navigateToDetail,
    getStatusColor,
  };
};
