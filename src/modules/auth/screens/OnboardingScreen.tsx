
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import { navigate } from '@/navigation/navigationRef';  

export const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  return (
    <ScreenWrapper style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <View style={styles.placeholderImage}>
           <Text style={styles.emoji}>🍵</Text>
        </View>
        <Text style={styles.title}>Welcome to Teaboi Vendor</Text>
        <Text style={styles.subtitle}>
          The best tea, delivered right to your doorstep. Experience the freshness today.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button 
          title="Get Started" 
          onPress={() => navigate('Signup')}
          style={styles.button}
        />
        <Button 
          title="I already have an account" 
          variant="outline"
          onPress={() => navigate('Login')}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    justifyContent: 'space-between',
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emoji: {
    fontSize: 50,
  },
  title: {
    ...theme.typography.header,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.m,
  },
  actions: {
    marginBottom: theme.spacing.l,
    gap: theme.spacing.m, // React Native 0.71+ supports gap in layouts
  },
  button: {
    marginBottom: theme.spacing.s,
  },
});
