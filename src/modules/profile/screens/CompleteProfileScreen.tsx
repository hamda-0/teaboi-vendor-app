import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import pixelPerfect from '@/utils/pixelPerfect';
import * as ImagePicker from 'expo-image-picker';
import { PermissionService } from '@/services/PermissionService';
import { goBack, navigate } from '@/navigation/navigationRef';
import { ImagePickerModal } from '@shared/components/modals/ImagePickerModal';
import { useCompleteProfile } from '../hooks/useCompleteProfile';
import { useAuthStore } from '@store/useAuthStore';
import { Input } from '@shared/components/Input/Input';
import { formatCNIC } from '@/utils/regex';
import { SuccessModal } from '@shared/components/modals/SuccessModal';

type DocumentType = 'profile' | 'cnicFront' | 'cnicBack' | 'passport';

export const CompleteProfileScreen = () => {
  const user = useAuthStore((state: any) => state.user);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeDocType, setActiveDocType] = useState<DocumentType | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const { submitProfile, isLoading: submitting,success } = useCompleteProfile(() => {
    setIsSuccessModalVisible(true);
  });
  
  const [images, setImages] = useState<{ [key in DocumentType]: string | null }>({
    profile: user?.profilePicUrl || null,
    cnicFront: null,
    cnicBack: null,
    passport: null,
  });

  const [cnicNumber, setCnicNumber] = useState('');



  const handleCnicChange = (text: string) => {
    const formatted = formatCNIC(text);
    setCnicNumber(formatted);
  };

  const handlePickImage = (type: DocumentType) => {
    setActiveDocType(type);
    setIsModalVisible(true);
  };

  const handleSelectCamera = async () => {
    setIsModalVisible(false);
    if (!activeDocType) return;

    const hasPermission = await PermissionService.requestCameraPermission();
    if (hasPermission) {
      navigate('Camera', {
        onPhotoTaken: (uri: string) => {
          setImages((prev) => ({ ...prev, [activeDocType]: uri }));
        },
      });
    }
  };

  const handleSelectGallery = async () => {
    setIsModalVisible(false);
    if (!activeDocType) return;

    const hasPermission = await PermissionService.requestGalleryPermission();
    if (hasPermission) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: activeDocType === 'profile',
        aspect: activeDocType === 'profile' ? [1, 1] : undefined,
        quality: 0.7,
      });

      if (!result.canceled) {
        setImages((prev) => ({ ...prev, [activeDocType]: result.assets[0].uri }));
      }
    } else {
      Alert.alert('Permission denied', 'You need to grant gallery permission to pick an image');
    }
  };

  const validate = () => {
    if (!images.profile) return 'Profile image is required';
    if (!images.cnicFront) return 'CNIC front image is required';
    if (!images.cnicBack) return 'CNIC back image is required';
    if (!images.passport) return 'Passport image is required';
    if (!cnicNumber) return 'CNIC number is required';
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    if (!cnicRegex.test(cnicNumber)) return 'CNIC must be in format: XXXXX-XXXXXXX-X';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Incomplete Profile', error);
      return;
    }

    submitProfile({
      profile: images.profile!,
      cnicFront: images.cnicFront!,
      cnicBack: images.cnicBack!,
      passport: images.passport!,
      cnicNumber: cnicNumber,
    });
  };

  const DocumentPickerField = ({ 
    label, 
    type, 
    value 
  }: { 
    label: string; 
    type: DocumentType; 
    value: string | null 
  }) => (
    <View style={styles.documentField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        style={[styles.uploadCard, value ? styles.uploadCardFilled : null]} 
        onPress={() => handlePickImage(type)}
        activeOpacity={0.7}
      >
        {value ? (
          <Image source={{ uri: value }} style={styles.documentImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <View style={styles.uploadIconContainer}>
              <Text style={styles.uploadIcon}>📤</Text>
            </View>
            <Text style={styles.uploadText}>Upload {label}</Text>
          </View>
        )}
        {value && (
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>Edit</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Complete Profile</Text>
        <View style={{ width: pixelPerfect(44) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Document Verification</Text>
          <Text style={styles.introSubtitle}>
            Please upload clear photos of your identification documents for account verification.
          </Text>
        </View>

        <View style={styles.profileImageSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => handlePickImage('profile')}
          >
            {images.profile ? (
              <Image source={{ uri: images.profile }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profilePlaceholderIcon}>👤</Text>
              </View>
            )}
            <View style={styles.profileEditBadge}>
              <Text style={styles.profileEditBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileImageLabel}>Profile Picture</Text>
        </View>

        <View style={styles.documentsSection}>
          <View style={styles.inputSection}>
            <Input
              label="CNIC Number"
              placeholder="e.g. 42101-1234567-1"
              value={cnicNumber}
              onChangeText={handleCnicChange}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>

          <DocumentPickerField 
            label="CNIC Front" 
            type="cnicFront" 
            value={images.cnicFront} 
          />
          <DocumentPickerField 
            label="CNIC Back" 
            type="cnicBack" 
            value={images.cnicBack} 
          />
          <DocumentPickerField 
            label="Passport" 
            type="passport" 
            value={images.passport} 
          />
        </View>

        <View style={styles.footer}>
          <Button
            title="Submit for Approval"
            onPress={handleSubmit}
            loading={submitting}
            disabled={success}
            style={styles.submitButton}
          />
          <Text style={styles.footerNote}>
            Verification usually takes 24-48 hours.
          </Text>
        </View>
      </ScrollView>

      <ImagePickerModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectCamera={handleSelectCamera}
        onSelectGallery={handleSelectGallery}
      />

      <SuccessModal
        isVisible={isSuccessModalVisible}
        onClose={() => {
          setIsSuccessModalVisible(false);
        }}
        title="Application Submitted!"
        message="Your documents have been received. We'll notify you once our team reviews your profile (usually within 24-48 hours)."
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: pixelPerfect(44),
    height: pixelPerfect(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: pixelPerfect(22),
  },
  backIcon: { fontSize: pixelPerfect(24), color: theme.colors.text.primary },
  title: {
    ...theme.typography.subheader,
    fontSize: pixelPerfect(18),
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  introSection: {
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  introTitle: {
    ...theme.typography.header,
    fontSize: pixelPerfect(24),
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  introSubtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    lineHeight: pixelPerfect(20),
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  profileImageContainer: {
    width: pixelPerfect(110),
    height: pixelPerfect(110),
    borderRadius: pixelPerfect(55),
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: pixelPerfect(110),
    height: pixelPerfect(110),
    borderRadius: pixelPerfect(55),
  },
  profilePlaceholder: {
    width: pixelPerfect(110),
    height: pixelPerfect(110),
    borderRadius: pixelPerfect(55),
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderIcon: {
    fontSize: pixelPerfect(40),
  },
  profileEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: pixelPerfect(36),
    height: pixelPerfect(36),
    borderRadius: pixelPerfect(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  profileEditBadgeText: {
    fontSize: pixelPerfect(14),
  },
  profileImageLabel: {
    ...theme.typography.caption,
    marginTop: theme.spacing.s,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  documentsSection: {
    paddingHorizontal: theme.spacing.l,
  },
  inputSection: {
    marginBottom: theme.spacing.l,
  },
  documentField: {
    marginBottom: theme.spacing.l,
  },
  fieldLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  uploadCard: {
    height: pixelPerfect(160),
    width: '100%',
    borderRadius: pixelPerfect(16),
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadCardFilled: {
    borderStyle: 'solid',
    borderColor: theme.colors.primary,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: pixelPerfect(48),
    height: pixelPerfect(48),
    borderRadius: pixelPerfect(24),
    backgroundColor: '#E7F9F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  uploadIcon: {
    fontSize: pixelPerfect(24),
  },
  uploadText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  documentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBadge: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: pixelPerfect(20),
  },
  editBadgeText: {
    color: 'white',
    fontSize: pixelPerfect(12),
    fontWeight: '600',
  },
  footer: {
    padding: theme.spacing.l,
    marginTop: theme.spacing.m,
  },
  submitButton: {
    width: '100%',
    height: pixelPerfect(52),
  },
  footerNote: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.m,
  },
});
