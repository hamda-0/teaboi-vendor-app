
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import { useOtpVerification } from '../hooks/useOtpVerification';

export const OtpVerificationScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const { email, flow } = route.params || { email: 'your email' };
  const {
    code,
    countdown,
    inputRef,
    handleVerify,
    handleResend,
    onCodeChange,
    isComplete,
    isLoading,
    codeDigitsArray,
  } = useOtpVerification(email, flow);


  return (
    <ScreenWrapper style={styles.container} onPress={Keyboard.dismiss}>
      <View style={styles.header}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to:{'\n'}
          <Text style={styles.highlight}>{email}</Text>
        </Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.codeContainer}>
          {/* Visible Code Boxes */}
          {codeDigitsArray.map((_, index) => {
            const digit = code[index];
            const isFocused = index === code.length;
            return (
              <TouchableOpacity
                key={index} 
                style={[
                  styles.codeBox, 
                  isFocused && styles.codeBoxFocused,
                  digit && styles.codeBoxFilled
                ]}
                onPress={() => inputRef.current?.focus()}
                activeOpacity={1}
              >
                <Text style={styles.digitText}>{digit || ''}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hidden Input for Logic */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={onCodeChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          style={styles.hiddenInput}
          maxLength={6}
          editable={!isLoading}
        />
      </View>

      <View style={styles.actions}>
        <Button 
          title="Verify" 
          onPress={handleVerify}
          disabled={!isComplete}
          loading={isLoading}
          style={styles.button}
        />
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResend} 
            disabled={countdown > 0 || isLoading}
          >
            <Text style={[
              styles.resendLink, 
              (countdown > 0 || isLoading) && styles.resendDisabled
            ]}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.header,
    marginBottom: theme.spacing.m,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  highlight: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  inputSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
    gap: theme.spacing.s,
  },
  codeBox: {
    width: 50,
    height: 60,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  codeBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#fff',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codeBoxFilled: {
    borderColor: theme.colors.text.primary,
    backgroundColor: '#fff',
  },
  digitText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  actions: {
    marginBottom: theme.spacing.xxl,
  },
  button: {
    marginBottom: theme.spacing.l,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  resendLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  resendDisabled: {
    color: theme.colors.text.placeholder,
  },
});
