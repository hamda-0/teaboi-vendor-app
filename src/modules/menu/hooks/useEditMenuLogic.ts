import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { menuService, Category, MenuItem } from '../services/menuService';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from './useCategories';

export const useEditMenuLogic = (navigation: any, item: MenuItem) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(item.categoryId);
  const [isAvailable, setIsAvailable] = useState(item.isAvailable);
  
  const { categories, isLoadingCats } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !price || isNaN(Number(price))) {
      Alert.alert('Validation Error', 'Please enter valid name and price');
      return;
    }

    try {
      setIsSubmitting(true);
      await menuService.updateMenuItem(item.id, {
        name: name.trim(),
        price: Number(price),
        categoryId: selectedCategoryId,
        isAvailable,
      });

      queryClient.invalidateQueries({ queryKey: ['vendorMenu'] });
      Alert.alert('Success', 'Menu item updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setShowCategoryPicker(false);
  };

  const toggleCategoryPicker = () => setShowCategoryPicker(!showCategoryPicker);

  const selectedCategoryName = categories.find((c: Category) => c.id === selectedCategoryId)?.name || 'Select Category';

  return {
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
  };
};
