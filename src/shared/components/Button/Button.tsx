
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../../theme';
import { styles } from './styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style,
  textStyle
}: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    if (isPrimary) return theme.colors.primary;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.text.placeholder;
    if (isPrimary) return theme.colors.text.light;
    return theme.colors.primary;
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border;
    if (isOutline) return theme.colors.primary;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isOutline ? 1.5 : 0,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
