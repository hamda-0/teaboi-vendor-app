import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { theme } from '@theme/index';
import { Ionicons } from '@expo/vector-icons';
import { useMenuLogic } from '../hooks/useMenuLogic';
import { useMenuItemCard } from '../hooks/useMenuItemCard';

const MenuItemCard = ({ item, onDelete, onEdit, onToggle }: any) => {
  const { localAvailable, handleToggle } = useMenuItemCard(item, onToggle);

  return (
    <View style={styles.menuCard}>
      <View style={styles.cardInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.categoryName}>{item.category?.name || 'Uncategorized'}</Text>
        <Text style={styles.itemPrice}>Rs {item.price}</Text>
      </View>
      
      <View style={styles.cardActions}>
        <Switch
          value={localAvailable}
          onValueChange={handleToggle}
          trackColor={{ false: '#CBD5E1', true: '#10B981' }}
        />
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => onEdit(item)}
        >
          <Ionicons name="pencil-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const MenuScreen = ({ navigation }: { navigation: any }) => {
  const {
    menuItems,
    isLoading,
    error,
    isRefetching,
    refetch,
    handleDelete,
    toggleItem,
    navigateToAddItem,
    navigateToEditItem,
  } = useMenuLogic(navigation);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
      </View>
      
      {isLoading && !isRefetching ? (
         <View style={styles.center}>
           <ActivityIndicator size="large" color={theme.colors.primary} />
         </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>Could not load your menu items.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={menuItems}
          renderItem={({ item }) => (
            <MenuItemCard 
              item={item} 
              onDelete={handleDelete} 
              onEdit={navigateToEditItem} 
              onToggle={toggleItem}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>Your menu is empty</Text>
              <Text style={styles.emptySubtitle}>Start adding items to your menu so customers can order from you.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={navigateToAddItem}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  menuCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  categoryName: {
    fontSize: 12,
    color: theme.colors.grey,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    lineHeight: 36,
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
