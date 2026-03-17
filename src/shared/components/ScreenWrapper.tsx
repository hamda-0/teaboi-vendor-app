
import React from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  onPress?: () => void;
}

export const ScreenWrapper = ({ 
  children, 
  style, 
  scroll = false, 
  keyboardAvoiding = true,
  backgroundColor = theme.colors.background 
}: ScreenWrapperProps) => {
  const Container = scroll ? ScrollView : View;
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Container 
          style={[styles.container, style]}
          contentContainerStyle={scroll ? styles.scrollContent : undefined}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
