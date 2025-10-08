interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get a cached value or fetch and cache it
 * @param key - Unique cache key
 * @param fetchFn - Function to fetch the value if not cached
 * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 * @returns The cached or freshly fetched value
 */
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const value = await fetchFn();
  cache.set(key, {
    value,
    expiresAt: now + (ttlSeconds * 1000)
  });

  return value;
}

/**
 * Clear all cached values
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear a specific cache entry
 */
export function clearCacheEntry(key: string): void {
  cache.delete(key);
}
