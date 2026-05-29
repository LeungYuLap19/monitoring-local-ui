export function parseJsonValue<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function readStorageJson<T>(
  storage: Storage | undefined | null,
  key: string,
  fallback: T,
): T {
  if (!storage) return fallback;
  return parseJsonValue<T>(storage.getItem(key), fallback);
}

export function writeStorageJson(
  storage: Storage | undefined | null,
  key: string,
  value: unknown,
): void {
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
}
