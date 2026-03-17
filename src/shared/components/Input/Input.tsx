
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, KeyboardTypeOptions } from 'react-native';
import { theme } from '../../../theme';
import { styles } from './styles';

export const Input = ({
  label,
  error,
  secureTextEntry,
  placeholder,
  value,
  onChangeText,
  onBlur,
  keyboardType = 'default',
  autoCapitalize = 'none',
  containerStyle,
  editable = true,
  ...props
}:{
  label?:string,
  error?:string,
  secureTextEntry?:boolean,
  placeholder?:string,
  value?:string,
  onChangeText?:(value:string)=>void,
  onBlur?: (e: any) => void,
  keyboardType?: KeyboardTypeOptions,
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters',
  containerStyle?:any,
  editable?: boolean,
  [key: string]: any;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          !editable && { opacity: 0.6, backgroundColor: '#f5f5f5' }
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.placeholder}
          secureTextEntry={isSecure}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Text style={styles.eyeText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

