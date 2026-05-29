import { TRPCClientError, type HTTPHeaders, type Operation } from '@trpc/client';
import type { TrpcClientConfig } from '../../../types/lib/trpc';
import { TrpcRequestError, type OperationWithFlags } from '../../../types/lib/trpc';
import { asString, isObjectRecord } from './http';

export function normalizeUrl(url?: string, trpcPath: string = '/trpc'): string {
  const baseUrl = url ?? import.meta.env.VITE_TRPC_URL ?? import.meta.env.VITE_API_BASE_URL ?? '';
  const normalizedPath = trpcPath.startsWith('/') ? trpcPath : `/${trpcPath}`;

  if (!baseUrl.trim()) {
    return normalizedPath;
  }

  if (baseUrl.endsWith(normalizedPath)) {
    return baseUrl;
  }

  return `${baseUrl.replace(/\/+$/, '')}${normalizedPath}`;
}

export function resolveFetch(
  fetchImpl: typeof fetch | undefined,
  withCredentials: boolean | undefined,
): typeof fetch | undefined {
  if (withCredentials === undefined) {
    return fetchImpl;
  }

  const targetFetch = fetchImpl ?? fetch;
  return (input, init) =>
    targetFetch(input, {
      ...init,
      credentials: withCredentials ? 'include' : 'omit',
    });
}

export function appendHeaders(target: Headers, source?: HTTPHeaders): void {
  if (!source) return;

  if (typeof (source as { [Symbol.iterator]?: unknown })[Symbol.iterator] === 'function') {
    for (const [key, value] of source as Iterable<[string, string]>) {
      target.set(key, value);
    }
    return;
  }

  for (const [key, value] of Object.entries(source as Record<string, string | string[] | undefined>)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      target.delete(key);
      for (const item of value) target.append(key, item);
      continue;
    }
    target.set(key, value);
  }
}

export function toHeaderObject(headers: Headers): Record<string, string> {
  const output: Record<string, string> = {};
  headers.forEach((value, key) => {
    output[key] = value;
  });
  return output;
}

export function normalizeTrpcError(error: unknown, op: Operation): TrpcRequestError {
  const trpcError = error instanceof TRPCClientError
    ? error
    : TRPCClientError.from(error instanceof Error || isObjectRecord(error) ? error : new Error(String(error)));
  const data = isObjectRecord(trpcError.data) ? trpcError.data : undefined;
  const meta = isObjectRecord(trpcError.meta) ? trpcError.meta : undefined;

  const requestId =
    asString((meta?.responseJSON as Record<string, unknown> | undefined)?.requestId) ??
    asString(data?.requestId);

  return new TrpcRequestError({
    message: trpcError.message || 'tRPC request failed',
    path: op.path,
    procedureType: op.type,
    httpStatus: typeof data?.httpStatus === 'number' ? data.httpStatus : undefined,
    trpcCode: asString(data?.code),
    requestId,
    data,
    meta,
  });
}

export function toTrpcRequestError(error: unknown, operation?: Operation): TrpcRequestError {
  if (error instanceof TrpcRequestError) {
    return error;
  }

  const fallbackOperation: Operation = operation ?? {
    id: -1,
    path: 'unknown',
    type: 'query',
    input: undefined,
    context: {},
    signal: null,
  };

  return normalizeTrpcError(error, fallbackOperation);
}

export async function resolveHeaders(opList: Operation[], config: TrpcClientConfig): Promise<HTTPHeaders> {
  const composed = new Headers();

  if (config.headers) {
    const resolvedHeaders = typeof config.headers === 'function'
      ? await config.headers({ opList })
      : config.headers;
    appendHeaders(composed, resolvedHeaders);
  }

  // httpBatchLink sends one header set per batch request.
  // We take context flags from the first operation in the batch.
  const firstOperation = opList[0] as OperationWithFlags | undefined;
  if (firstOperation?.context?.headers) {
    appendHeaders(composed, firstOperation.context.headers);
  }

  if (!firstOperation?.context?.skipApiKey) {
    const apiKey = (await config.getApiKey?.()) ?? config.apiKey ?? import.meta.env.VITE_API_KEY;
    if (apiKey && !composed.has('x-api-key')) {
      composed.set('x-api-key', apiKey);
    }
  }

  if (!firstOperation?.context?.skipAuth) {
    const token = await config.getAccessToken?.();
    if (token && !composed.has('Authorization')) {
      composed.set('Authorization', `${config.tokenType ?? 'Bearer'} ${token}`);
    }
  }

  return toHeaderObject(composed);
}

export function createLocalStorageTokenResolver(storageKeys: string | string[]): () => string | undefined {
  const keys = Array.isArray(storageKeys) ? storageKeys : [storageKeys];
  return () => {
    if (typeof window === 'undefined') return undefined;

    for (const key of keys) {
      const token = window.localStorage.getItem(key);
      if (token) return token;
    }
    return undefined;
  };
}
