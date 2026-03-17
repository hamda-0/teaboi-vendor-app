import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { menuService, Category } from '../services/menuService';

export const useAddMenuItem = (navigation: any) => {
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
      if (response.data && response.data.data) {
        setCategories(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCategoryId(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoadingCats(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid item name');
      return;
    }
    
    if (!price || isNaN(Number(price))) {
      Alert.alert('Validation Error', 'Please enter a valid price');
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

      Alert.alert('Success', 'Menu item added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Create item failed', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.name || 'Select a Category';

  return {
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
  }
};
