import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export const useDataCache = <T>(defaultTtl: number = 5 * 60 * 1000) => { // 5 minutes par défaut
  const [cache] = useState(() => new Map<string, CacheEntry<T>>());
  const loadingRef = useRef(new Set<string>());

  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (isExpired(entry)) {
      cache.delete(key);
      return null;
    }
    
    return entry.data;
  }, [cache, isExpired]);

  const set = useCallback((key: string, data: T, ttl?: number): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    });
  }, [cache, defaultTtl]);

  const invalidate = useCallback((key: string): void => {
    cache.delete(key);
  }, [cache]);

  const clear = useCallback((): void => {
    cache.clear();
  }, [cache]);

  const isCached = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    return entry ? !isExpired(entry) : false;
  }, [cache, isExpired]);

  const isLoading = useCallback((key: string): boolean => {
    return loadingRef.current.has(key);
  }, []);

  const setLoading = useCallback((key: string, loading: boolean): void => {
    if (loading) {
      loadingRef.current.add(key);
    } else {
      loadingRef.current.delete(key);
    }
  }, []);

  return {
    get,
    set,
    invalidate,
    clear,
    isCached,
    isLoading,
    setLoading,
  };
};
