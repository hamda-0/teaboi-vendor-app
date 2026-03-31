
import React from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ScrollView, ViewStyle, Image } from 'react-native';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  onPress?: () => void;
  edges?: Edge[];
  customStyles?: ViewStyle | ViewStyle[];
}

export const ScreenWrapper = ({ 
  children, 
  style, 
  scroll = false, 
  keyboardAvoiding = true,
  customStyles,
  backgroundColor = theme.colors.background,
   edges = [],
}: ScreenWrapperProps) => {
  const Container = scroll ? ScrollView : View;
  const insets =useSafeAreaInsets();
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea,,customStyles, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Container 
          style={[styles.container, {paddingTop:insets.top},style]}//paddingBottom:insets.bottom,
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
    star: {
        position: 'absolute',
        bottom:0
  },
  star7: {
    position: 'absolute',
    top:0,
    right:0
  }
});
