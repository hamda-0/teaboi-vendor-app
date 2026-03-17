import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Input } from '@shared/components/Input/Input';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import { Ionicons } from '@expo/vector-icons';
import { useAddMenuItem } from '../hooks/useAddMenuItem';

export const AddMenuItemScreen = ({ navigation }: { navigation: any }) => {
  const {
    name, setName,
    price, setPrice,
    categories,
    selectedCategoryId, setSelectedCategoryId,
    isAvailable, setIsAvailable,
    isLoadingCats,
    isSubmitting,
    showCategoryPicker, setShowCategoryPicker,
    selectedCategoryName,
    handleCreate,
  } = useAddMenuItem(navigation);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Menu Item</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Input
          label="Item Name"
          placeholder="e.g. Masala Chai"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Price (Rs)"
          placeholder="e.g. 50"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          containerStyle={{ marginTop: 16 }}
        />

        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Category</Text>
          {isLoadingCats ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 10 }} />
          ) : (
            <>
              <TouchableOpacity 
                style={styles.categoryDropdown}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.categoryDropdownText}>{selectedCategoryName}</Text>
                <Text style={styles.dropdownIcon}>{showCategoryPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={styles.pickerContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pickerItem,
                        selectedCategoryId === cat.id && styles.pickerItemSelected
                      ]}
                      onPress={() => {
                        setSelectedCategoryId(cat.id);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedCategoryId === cat.id && styles.pickerItemTextSelected
                      ]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {categories.length === 0 && (
                    <Text style={styles.pickerItemText}>No categories found</Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Available to Order</Text>
          <Switch
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            thumbColor={'#FFFFFF'}
            onValueChange={setIsAvailable}
            value={isAvailable}
          />
        </View>

      </View>
      <View style={styles.footer}>
        <Button 
          title="Save Item" 
          onPress={handleCreate} 
          loading={isSubmitting} 
          disabled={isSubmitting || isLoadingCats}
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
  placeholder: {
    width: 40,
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
    zIndex: 10,
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
  dropdownIcon: {
    color: theme.colors.text.secondary,
    fontSize: 12,
  },
  pickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: 'white',
    maxHeight: 200,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  pickerItemTextSelected: {
    color: '#10B981',
    fontWeight: '600',
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
  footer: {
    paddingVertical: 24,
  },
});
