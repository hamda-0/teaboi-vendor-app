import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { theme } from '@theme/index';
import pixelPerfect from '@/utils/pixelPerfect';
import { Button } from '../Button/Button';

interface SuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isVisible,
  onClose,
  title = "Success!",
  message = "Your profile has been submitted for approval.",
  buttonText = "Got it"
}) => {
 
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      checkmarkScale.value = withDelay(400, withSpring(1));
    } else {
      checkmarkScale.value = 0;
    }
  }, [isVisible]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"

      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container]}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.checkmarkCircle, checkmarkStyle]}>
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <Button 
            title={buttonText} 
            onPress={onClose} 
            style={styles.button}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  container: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: pixelPerfect(24),
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  iconContainer: {
    width: pixelPerfect(80),
    height: pixelPerfect(80),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  checkmarkCircle: {
    width: pixelPerfect(80),
    height: pixelPerfect(80),
    borderRadius: pixelPerfect(40),
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: pixelPerfect(40),
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    ...theme.typography.header,
    fontSize: pixelPerfect(24),
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: pixelPerfect(22),
  },
  button: {
    width: '100%',
    height: pixelPerfect(52),
  },
});
