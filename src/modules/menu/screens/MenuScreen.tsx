import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { theme } from '@theme/index';

export const MenuScreen = ({ navigation }: { navigation: any }) => {

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
      </View>
      
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🍽️</Text>
        <Text style={styles.emptyTitle}>Your menu is empty</Text>
        <Text style={styles.emptySubtitle}>Start adding items to your menu so customers can order from you.</Text>
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddMenuItem')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    lineHeight: 36,
  },
});
