import { AuthErrorStatus } from './auth';

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  data?: any;
  status?: AuthErrorStatus;
  approvalStatus?: string;
}
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  statusCode?: number;
  data?: T;
}
