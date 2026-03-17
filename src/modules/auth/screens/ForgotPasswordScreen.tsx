import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { Input } from '@shared/components/Input/Input';
import { theme } from '@theme/index';
import { useForgotPassword } from '../hooks/useForgotPassword';

export const ForgotPasswordScreen = ({ navigation }: { navigation: any }) => {
  const { handleForgotPassword, validate, initialValues, isLoading } = useForgotPassword();

  return (
    <ScreenWrapper scroll style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a code to reset your password.
        </Text>
      </View>

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleForgotPassword}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="hello@teaboi.com"
              keyboardType="email-address"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={(touched.email && errors.email) || undefined}
            />

            <Button 
              title="Send Reset Code" 
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        )}
      </Formik>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back to Login</Text>
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
    marginTop: theme.spacing.l,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xxl,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
