export enum UserRole {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

export enum AccountStatus {
  ACTIVE = 'active',
  PENDING_VERIFICATION = 'pending_verification',
  PENDING_PROFILE = 'pending_profile',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DEACTIVATED = 'deactivated',
}

export type AuthErrorStatus =
  | 'pending_verification'
  | 'suspended'
  | 'banned'
  | 'pending_approval';

export interface VendorProfile {
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isProfileComplete: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  roles?: UserRole[];
  status?: AccountStatus;
  profilePicUrl?: string | null;
}

export interface LoginResponseData {
  accessToken: string;
  expiresIn: number;
  message: string;
  refreshToken: string;
  user: User;
  vendorProfile: VendorProfile;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string | null) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}
