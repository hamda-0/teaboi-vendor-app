import React from 'react';
import { Alert } from 'react-native';

export const useMenuItemCard = (item: any, onToggle: (id: string) => Promise<any>) => {
  const [localAvailable, setLocalAvailable] = React.useState(item.isAvailable);

  const handleToggle = async () => {
    const previousValue = localAvailable;
    // Instant optimistic update
    setLocalAvailable(!previousValue);
    
    try {
      await onToggle(item.id);
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
