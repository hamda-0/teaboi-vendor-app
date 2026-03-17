
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '@modules/auth/screens/OnboardingScreen';
import { LoginScreen } from '@modules/auth/screens/LoginScreen';
import { SignupScreen } from '@modules/auth/screens/SignupScreen';
import { OtpVerificationScreen } from '@modules/auth/screens/OtpVerificationScreen';
import { ForgotPasswordScreen } from '@modules/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@modules/auth/screens/ResetPasswordScreen';
import { CompleteProfileScreen } from '@/modules/profile/screens/CompleteProfileScreen';
import { CameraScreen } from '@modules/profile/screens/CameraScreen';


const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      
    </Stack.Navigator>
  );
};
