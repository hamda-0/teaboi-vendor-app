import React from 'react';
import { Alert } from 'react-native';
import { useVendorMenu } from './useVendorMenu';

export const useMenuItemCard = (item: any) => {
  const { toggleItem } = useVendorMenu();
  const [localAvailable, setLocalAvailable] = React.useState(item.isAvailable);

  const handleToggle = async () => {
    const previousValue = localAvailable;
    // Instant toggle
    setLocalAvailable(!previousValue);
    
    try {
      await toggleItem(item.id);
    } catch (err) {
      // Revert on failure
      setLocalAvailable(previousValue);
      Alert.alert('Update Failed', 'Could not sync with server. Reverting status.');
    }
  };

  return {
    localAvailable,
    handleToggle,
  };
};
