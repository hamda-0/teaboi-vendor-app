import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { menuService, Category } from '../services/menuService';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from './useCategories';

export const useAddMenuLogic = (navigation: any) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  const { categories, isLoadingCats } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (!selectedCategoryId && categories?.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleAdd = async () => {
    if (!name.trim() || !price || isNaN(Number(price))) {
      Alert.alert('Validation Error', 'Please enter valid name and price');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);
      await menuService.createMenuItem({
        name: name.trim(),
        price: Number(price),
        categoryId: selectedCategoryId,
        isAvailable,
      });

      queryClient.invalidateQueries({ queryKey: ['vendorMenu'] });
      Alert.alert('Success', 'Menu item added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to add item');
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
    handleAdd,
    selectCategory,
    toggleCategoryPicker,
  };
};
