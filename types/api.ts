
export interface ApiResponse<T> {
  data: { data: T };
  message?: string;
  status: number;
}

export interface ApiError {
  errorMessages: { errorCode: number; errorMessage: string }[];
}

export interface ApiResponseWrapper<T> {
  isSuccess: boolean;
  message: string;
  value: T;
}


export type ValueOf<T> = T[keyof T];
