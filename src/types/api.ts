export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  data?: any;
}
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  statusCode?: number;
  data?: T;
}
