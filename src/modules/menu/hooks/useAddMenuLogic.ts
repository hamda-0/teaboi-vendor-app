import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { menuService, Category } from '../services/menuService';
import { useQueryClient } from '@tanstack/react-query';

export const useAddMenuLogic = (navigation: any) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState(true);
  
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
    handleAdd,
    selectCategory,
    toggleCategoryPicker,
  };
};
