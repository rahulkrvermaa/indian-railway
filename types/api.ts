export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  cached?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
