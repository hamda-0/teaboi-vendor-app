import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { ScreenWrapper } from '@shared/components/ScreenWrapper';
import { Button } from '@shared/components/Button/Button';
import { theme } from '@theme/index';
import { useAuthStore } from '@store/useAuthStore';
import pixelPerfect from '@/utils/pixelPerfect';
import { navigate } from '@/navigation/navigationRef';
import { profileService } from '../services/profileService';

export const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const user = useAuthStore((state) => state.user);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileService.deleteAccount();
              logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { id: 'orders', title: 'My Orders', icon: '📦', onPress: () => navigate('Orders' as never) },
    { id: 'favorites', title: 'Favorites', icon: '❤️', onPress: () => console.log('Favorites pressed') },
    { id: 'addresses', title: 'Saved Addresses', icon: '📍', onPress: () => console.log('Addresses pressed') },
    { id: 'payment', title: 'Payment Methods', icon: '💳', onPress: () => console.log('Payment pressed') },
    { id: 'notifications', title: 'Notifications', icon: '🔔', onPress: () => console.log('Notifications pressed') },
    { id: 'settings', title: 'Settings', icon: '⚙️', onPress: () => console.log('Settings pressed') },
    { id: 'help', title: 'Help & Support', icon: '❓', onPress: () => console.log('Help pressed') },
  ];

  return (
    <ScreenWrapper scroll style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user?.profilePicUrl ? (
            <Image source={{ uri: user.profilePicUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'G'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email provided'}</Text>
        <Button
          title="Edit Profile"
          variant="outline"
          onPress={handleEditProfile}
          style={styles.editButton}
        />
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
        <Button
          title="Delete Account"
          variant="outline"
          onPress={handleDeleteAccount}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.header,
    marginBottom: theme.spacing.xs,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: pixelPerfect(16),
    paddingHorizontal: theme.spacing.l,
  },
  avatarContainer: {
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: pixelPerfect(100),
    height: pixelPerfect(100),
    borderRadius: pixelPerfect(50),
  },
  avatarPlaceholder: {
    width: pixelPerfect(100),
    height: pixelPerfect(100),
    borderRadius: pixelPerfect(50),
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.header,
    color: theme.colors.text.light,
    fontSize: pixelPerfect(32),
  },
  userName: {
    ...theme.typography.subheader,
    fontSize: pixelPerfect(20),
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  userEmail: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.m,
    color: theme.colors.text.secondary,
  },
  editButton: {
    width: '100%',
    maxWidth: pixelPerfect(200),
  },
  menuSection: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: pixelPerfect(16),
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: pixelPerfect(24),
    marginRight: theme.spacing.m,
  },
  menuItemText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  menuArrow: {
    fontSize: pixelPerfect(24),
    color: theme.colors.text.secondary,
  },
  footer: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  logoutButtonText: {
    color: theme.colors.error,
  },
  deleteButton: {
    borderColor: theme.colors.error,
    marginTop: theme.spacing.m,
  },
  deleteButtonText: {
    color: theme.colors.error,
  },
});

