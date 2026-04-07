import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Input } from '@shared/components/Input/Input';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import pixelPerfect from '@/utils/pixelPerfect';

import * as ImagePicker from 'expo-image-picker';
import { PermissionService } from '@/services/PermissionService';
import { useEditProfile } from '../hooks/userEditProfile';
import { goBack, navigate } from '@/navigation/navigationRef';
import { FormikWrapper } from '@shared/components/FormikWrapper';
import { ImagePickerModal } from '@shared/components/modals/ImagePickerModal';
import { useCameraStore } from '@/store/useCameraStore';

export const EditProfileScreen = () => {
  const {
    profileData,
    loading,
    fetching,
    avatar,
    setAvatar,
    handleSave,
    validate,
  } = useEditProfile();

  const { capturedImage, clearCapturedImage } = useCameraStore();

  React.useEffect(() => {
    if (capturedImage) {
      setAvatar(capturedImage);
      clearCapturedImage();
    }
  }, [capturedImage]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePickImage = () => setIsModalVisible(true);

  const handleSelectCamera = async () => {
    setIsModalVisible(false);
    const hasPermission = await PermissionService.requestCameraPermission();
    if (hasPermission) {
      navigate('Camera');
    }
  };

  const handleSelectGallery = async () => {
    setIsModalVisible(false);
    const hasPermission = await PermissionService.requestGalleryPermission();
    if (hasPermission) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    }else{
      Alert.alert('Permission denied', 'You need to grant gallery permission to pick an image');
    }
  };

  return (
    <ScreenWrapper scroll style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: pixelPerfect(44) }} />
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profileData.name
                  ? profileData.name
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'G'}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <Text style={styles.editAvatarIcon}>📷</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FormikWrapper
        initialValues={profileData}
        onSubmit={(values) => handleSave(values)}
        validate={validate}
        enableReinitialize
      >
        {({ errors, touched, handleSubmit, setFieldTouched, setFieldValue, values }) => (
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={values.name}
              onChangeText={(val) => {
                setFieldTouched('name', true);
                setFieldValue('name', val);
              }}
              containerStyle={styles.input}
              editable={!loading && !fetching}
              error={touched.name ? errors.name : undefined}
            />

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={values.email}
              containerStyle={styles.input}
              editable={false}
              error={touched.email ? errors.email : undefined}
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={values.phone ?? ''}
              onChangeText={(val) => {
                setFieldTouched('phone', true);
                setFieldValue('phone', val);
              }}
              keyboardType="phone-pad"
              containerStyle={styles.input}
              error={touched.phone ? errors.phone : undefined}
              editable={!loading && !fetching}
            />

            <View style={styles.footer}>
              <Button
                title={fetching ? 'Loading Profile...' : 'Save Changes'}
                onPress={() => handleSubmit()}
                loading={loading}
                disabled={fetching}
                style={styles.saveButton}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => goBack()}
                style={styles.cancelButton}
                disabled={loading || fetching}
              />
            </View>
          </View>
        )}
      </FormikWrapper>

      <ImagePickerModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectCamera={handleSelectCamera}
        onSelectGallery={handleSelectGallery}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.m,
  },
  avatar: { width: pixelPerfect(120), height: pixelPerfect(120), borderRadius: pixelPerfect(60) },
  avatarPlaceholder: {
    width: pixelPerfect(120),
    height: pixelPerfect(120),
    borderRadius: pixelPerfect(60),
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.header,
    color: theme.colors.text.light,
    fontSize: pixelPerfect(40),
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    width: pixelPerfect(40),
    height: pixelPerfect(40),
    borderRadius: pixelPerfect(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editAvatarIcon: { fontSize: pixelPerfect(18) },
  form: {
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  input: { marginBottom: theme.spacing.m },
  footer: {
    padding: theme.spacing.l,
    marginTop: theme.spacing.m,
  },
  saveButton: { marginBottom: theme.spacing.m },
  cancelButton: { borderColor: 'transparent' },
});