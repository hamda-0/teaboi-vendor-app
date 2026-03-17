import React from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { Formik } from 'formik';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { Input } from '@shared/components/Input/Input';
import { theme } from '@theme/index';
import { useResetPassword } from '../hooks/useResetPassword';

export const ResetPasswordScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const { email, otp } = route.params || {};
  const { handleResetPassword, validate, initialValues, isLoading } = useResetPassword(email, otp);

  return (
    <ScreenWrapper scroll style={styles.container} onPress={Keyboard.dismiss}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Please enter your new password below.
        </Text>
      </View>

      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleResetPassword}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <Input
              label="New Password"
              placeholder="••••••••"
              secureTextEntry
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={(touched.password && errors.password) || undefined}
            />

            <Input
              label="Confirm New Password"
              placeholder="••••••••"
              secureTextEntry
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={(touched.confirmPassword && errors.confirmPassword) || undefined}
            />

            <Button 
              title="Reset Password" 
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        )}
      </Formik>
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
});
