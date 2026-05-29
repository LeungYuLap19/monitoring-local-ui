import type { HTTPHeaders, Operation } from '@trpc/client';

export type MaybePromise<T> = T | Promise<T>;

export type OperationContextFlags = {
  skipApiKey?: boolean;
  skipAuth?: boolean;
  headers?: HTTPHeaders;
};

export type OperationWithFlags = Operation & {
  context: Operation['context'] & OperationContextFlags;
};

export interface TrpcErrorContext {
  operation: Operation;
  url: string;
}

export interface TrpcRequestErrorInit {
  message: string;
  path: string;
  procedureType: Operation['type'];
  httpStatus?: number;
  trpcCode?: string;
  requestId?: string;
  data?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export class TrpcRequestError extends Error {
  readonly path: string;
  readonly procedureType: Operation['type'];
  readonly httpStatus?: number;
  readonly trpcCode?: string;
  readonly requestId?: string;
  readonly data?: Record<string, unknown>;
  readonly meta?: Record<string, unknown>;

  constructor({
    message,
    path,
    procedureType,
    httpStatus,
    trpcCode,
    requestId,
    data,
    meta,
  }: TrpcRequestErrorInit) {
    super(message);
    this.name = 'TrpcRequestError';
    this.path = path;
    this.procedureType = procedureType;
    this.httpStatus = httpStatus;
    this.trpcCode = trpcCode;
    this.requestId = requestId;
    this.data = data;
    this.meta = meta;
    Object.setPrototypeOf(this, TrpcRequestError.prototype);
  }
}

export type TrpcErrorHandler = (error: TrpcRequestError, context: TrpcErrorContext) => MaybePromise<void>;

export interface TrpcClientConfig {
  url?: string;
  trpcPath?: string;
  apiKey?: string;
  getApiKey?: () => MaybePromise<string | null | undefined>;
  getAccessToken?: () => MaybePromise<string | null | undefined>;
  tokenType?: string;
  withCredentials?: boolean;
  headers?: HTTPHeaders | ((opts: { opList: Operation[] }) => MaybePromise<HTTPHeaders>);
  includeLoggerLink?: boolean;
  fetch?: typeof fetch;
  onError?: TrpcErrorHandler;
}
