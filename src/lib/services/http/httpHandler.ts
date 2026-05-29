import { createTRPCClient, httpBatchLink, loggerLink, type Operation, type TRPCClient, type TRPCLink } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { TrpcRequestError, type TrpcClientConfig, type TrpcErrorContext, type TrpcErrorHandler } from '../../../types/lib/trpc';
import { createLocalStorageTokenResolver, normalizeTrpcError, normalizeUrl, resolveFetch, resolveHeaders, toTrpcRequestError } from '../../utils/http/trpc-service';

let globalTrpcErrorHandler: TrpcErrorHandler | undefined;

function createErrorLink<TRouter extends AnyRouter>(config: { url: string; onError?: TrpcErrorHandler }): TRPCLink<TRouter> {
  return () => ({ op, next }) =>
    observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(result) {
          observer.next(result);
        },
        error(error) {
          const normalizedError = normalizeTrpcError(error, op);
          const context: TrpcErrorContext = { operation: op, url: config.url };

          void config.onError?.(normalizedError, context);
          void globalTrpcErrorHandler?.(normalizedError, context);
          observer.error(error);
        },
        complete() {
          observer.complete();
        },
      });

      return unsubscribe;
    });
}

export function setGlobalTrpcErrorHandler(handler?: TrpcErrorHandler): void {
  globalTrpcErrorHandler = handler;
}

export function isTrpcRequestError(error: unknown): error is TrpcRequestError {
  return error instanceof TrpcRequestError;
}

export { createLocalStorageTokenResolver, toTrpcRequestError };

export function createAppTrpcClient<TRouter extends AnyRouter>(config: TrpcClientConfig = {}): TRPCClient<TRouter> {
  const url = normalizeUrl(config.url, config.trpcPath);
  const fetchImpl = resolveFetch(config.fetch, config.withCredentials);
  const links: TRPCLink<TRouter>[] = [];

  links.push(createErrorLink<TRouter>({ url, onError: config.onError }));

  if (config.includeLoggerLink) {
    links.push(
      loggerLink({
        enabled: (opts) =>
          import.meta.env.DEV ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
    );
  }

  links.push(
    httpBatchLink<TRouter>({
      url,
      fetch: fetchImpl,
      headers: (opts: { opList: Operation[] }) => resolveHeaders(opts.opList, config),
    } as any),
  );

  return createTRPCClient<TRouter>({ links });
}

// Untyped default client for immediate usage.
// Prefer creating a typed instance with your server AppRouter:
// `const trpc = createAppTrpcClient<AppRouter>(...)`
export const trpcClient = createAppTrpcClient<AnyRouter>();
