export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessEnvelope<TData = unknown> {
  success: true;
  message?: string;
  data?: TData;
  pagination?: ApiPagination;
  requestId?: string;
}

export interface ApiErrorEnvelope {
  success: false;
  errorKey?: string;
  error?: string;
  message?: string;
  requestId?: string;
}

export interface ProtectedApiResult<TData> {
  data: TData;
  message?: string;
  requestId?: string;
}

export interface ProtectedPaginatedApiResult<TData> extends ProtectedApiResult<TData> {
  pagination: ApiPagination | null;
}
