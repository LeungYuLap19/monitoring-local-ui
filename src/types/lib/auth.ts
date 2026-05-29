export type LoginMethod = 'email' | 'phone';
export type AppRole = 'user' | 'ngo';

export interface AuthUser {
  id?: string;
  emailOrPhone?: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  email?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  ngoId?: string;
}

export interface AuthApiSuccessEnvelope<TData = unknown> {
  success: true;
  message?: string;
  data?: TData;
  requestId?: string;
}

export interface AuthApiErrorEnvelope {
  success: false;
  errorKey?: string;
  error?: string;
  message?: string;
  requestId?: string;
}

export interface AuthChallengeRequest {
  email?: string;
  phoneNumber?: string;
  lang?: string;
}

export interface AuthVerifyRequest {
  email?: string;
  phoneNumber?: string;
  code: string;
  lang?: string;
}

export interface AuthVerifyResponseData {
  verified: boolean;
  isNewUser: boolean;
  userId?: string;
  role?: string;
  isVerified?: boolean;
  token?: string;
  linked?: {
    email?: string;
    phoneNumber?: string;
  };
}

export interface AuthRegisterUserRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

export interface AuthRegisterUserResponseData {
  userId: string;
  role: string;
  isVerified: boolean;
  token: string;
}

export interface AuthRefreshResponseData {
  accessToken: string;
  id: string;
}

export interface UserMeResponseData {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  verified?: boolean;
}

export interface AuthApiErrorInfo {
  status: number;
  errorKey?: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

export interface NgoLoginRequest {
  email: string;
  password: string;
}

export interface NgoLoginResponseData {
  userId: string;
  role: 'ngo';
  isVerified: boolean;
  token: string;
  ngoId: string;
}
