import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { Input } from '@shared/components/Input/Input';
import { theme } from '@theme/index';
import { useLogin } from '../hooks/useLogin';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Constants } from '@/config/constants';
import { navigate } from '@/navigation/navigationRef';


export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const { handleLogin, validate, initialValues, isLoading } = useLogin();
  const { startGoogleSignInFlow, startAppleSignInFlow, isLoading: isSocialLoading } = useSocialAuth();


  return (
    <ScreenWrapper scroll style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue your tea journey.</Text>
      </View>

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button 
              title="Log In" 
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
      {/*@todo apple login */}
        {/* <TouchableOpacity onPress={()=>{
          startAppleSignInFlow()
        }}>
           <Text>apple</Text>
        </TouchableOpacity> */}
      </View>



      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigate('Signup')}>
          <Text style={styles.linkText}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.l,
  },
  forgotPasswordText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  button: {
    marginTop: theme.spacing.s,
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

