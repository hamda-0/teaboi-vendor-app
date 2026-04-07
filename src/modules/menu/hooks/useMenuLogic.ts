import { Alert } from 'react-native';
import { useVendorMenu } from '../hooks/useVendorMenu';

export const useMenuLogic = (navigation: any) => {
  const {
    menuItems,
    isLoading,
    error,
    isRefetching,
    refetch,
    deleteItem,
    toggleItem,
  } = useVendorMenu();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) }
      ]
    );
  };

  const navigateToAddItem = () => navigation.navigate('AddMenuItem');
  const navigateToEditItem = (item: any) => navigation.navigate('EditMenuItem', { item });

  return {
    menuItems,
    isLoading,
    error,
    isRefetching,
    refetch,
    handleDelete,
    toggleItem,
    navigateToAddItem,
    navigateToEditItem,
  };
};
