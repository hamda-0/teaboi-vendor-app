import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { Input } from '@shared/components/Input/Input';
import { theme } from '@theme/index';
import { useSignup } from '../hooks/useSignup';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export const SignupScreen = ({ navigation }: { navigation: any }) => {
  const { handleSignup, validate, initialValues, isLoading } = useSignup(navigation);
  const { startGoogleSignInFlow, startAppleSignInFlow, isLoading: isSocialLoading } = useSocialAuth();

  return (
    <ScreenWrapper scroll style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Teaboi community today.</Text>
      </View>

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSignup}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              autoCapitalize="words"
              error={(touched.name && errors.name) || undefined}
            />
            <Input
              label="Email Address"
              placeholder="hello@teaboi.com"
              keyboardType="email-address"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={(touched.email && errors.email) || undefined}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={(touched.password && errors.password) || undefined}
            />
            <Input
              label="Phone Number"
              placeholder="555-0199"
              keyboardType="phone-pad"
              value={values.phone}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              error={(touched.phone && errors.phone) || undefined}
            />
            <Button 
              title="Sign Up" 
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        )}
      </Formik>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.line} />
      </View>
<View style={styles.socialContainer}>
        <GoogleSigninButton
          style={{height: 48 }}
          size={GoogleSigninButton.Size.Icon}
          // color={GoogleSigninButton.Color.Dark}
          onPress={startGoogleSignInFlow}
          disabled={isSocialLoading}
        />
        
        <TouchableOpacity onPress={()=>{
          startAppleSignInFlow()
        }}>
           <Text>apple auth test</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
  },
  header: {
    marginVertical: theme.spacing.xl,
  },
  title: {
    ...theme.typography.header,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: theme.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xxl,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.m,
  },
  socialContainer: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  googleButton: {
    width: '100%',
    height: 56,
  },
  appleButton: {
    width: '100%',
    height: 56,
  },
});
