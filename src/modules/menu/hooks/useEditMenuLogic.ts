import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { menuService, Category, MenuItem } from '../services/menuService';
import { useQueryClient } from '@tanstack/react-query';

export const useEditMenuLogic = (navigation: any, item: MenuItem) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(item.categoryId);
  const [isAvailable, setIsAvailable] = useState(item.isAvailable);
  
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCats(true);
      const response = await menuService.getCategories(1, 50);
      const resData = response as any;
      
      let fetchedCategories: Category[] = [];
      if (Array.isArray(resData?.data)) {
        fetchedCategories = resData.data;
      } else if (Array.isArray(resData?.data?.data)) {
        fetchedCategories = resData.data.data;
      }
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setIsLoadingCats(false);
    }
  };

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

  const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.name || 'Select Category';

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
