// Centralized localStorage abstraction
// Replace the implementation here to swap with a real API backend

const PREFIX = 'honeytrace_';

export const storageService = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('storageService.set error:', e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

// Storage keys
export const KEYS = {
  USERS: 'users',
  HIVES: 'hives',
  OBSERVATIONS: 'observations',
  HARVESTS: 'harvests',
  BATCHES: 'batches',
  LEDGER: 'ledger',
  SESSION: 'session',
  SEEDED: 'seeded',
};
