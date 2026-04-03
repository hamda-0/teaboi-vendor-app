import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Input } from '@shared/components/Input/Input';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import { Ionicons } from '@expo/vector-icons';
import { useEditMenuLogic } from '../hooks/useEditMenuLogic';
import { MenuItem } from '../services/menuService';

export const EditMenuItemScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { item }: { item: MenuItem } = route.params;
  const {
    name,
    setName,
    price,
    setPrice,
    categories,
    selectedCategoryId,
    isAvailable,
    setIsAvailable,
    isLoadingCats,
    isSubmitting,
    showCategoryPicker,
    selectedCategoryName,
    handleUpdate,
    selectCategory,
    toggleCategoryPicker,
  } = useEditMenuLogic(navigation, item);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Menu Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Input label="Item Name" value={name} onChangeText={setName} />
        <Input 
          label="Price (Rs)" 
          value={price} 
          onChangeText={setPrice} 
          keyboardType="numeric" 
          containerStyle={{ marginTop: 16 }} 
        />

        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Category</Text>
          {isLoadingCats ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <TouchableOpacity 
                style={styles.categoryDropdown}
                onPress={toggleCategoryPicker}
              >
                <Text style={styles.categoryDropdownText}>{selectedCategoryName}</Text>
                <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.grey} />
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={styles.pickerContainer}>
                  {categories.map((cat: any) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.pickerItem}
                      onPress={() => selectCategory(cat.id)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedCategoryId === cat.id && styles.selectedPickerItemText
                      ]}>
                        {cat.name}
                      </Text>
                      {selectedCategoryId === cat.id && (
                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Available to Order</Text>
            <Text style={styles.switchSubLabel}>Toggle if this item is currently in stock</Text>
          </View>
          <Switch 
            value={isAvailable} 
            onValueChange={setIsAvailable}
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Update Item" 
          onPress={handleUpdate}
          loading={isSubmitting}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  categoryContainer: {
    marginTop: 20,
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F8FAFC',
  },
  categoryDropdownText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  pickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  selectedPickerItemText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  switchSubLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    paddingVertical: 24,
  },
});
