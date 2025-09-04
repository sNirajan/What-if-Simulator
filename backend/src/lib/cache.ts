/**
 * Simple in-memory cache for dev/local use.
 * Key design: include ticker + start + end so entries are deterministic.
 */

import { LRUCache } from 'lru-cache';
export const cache = new LRUCache<string, any>({
  max: 300,                  // up to 300 entries
  ttl: 1000 * 60 * 60 * 24,  // 24h
});
