interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
  resetAt: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;  // 15-minute sliding window
const LOCK_MS = 30 * 60 * 1000;    // 30-minute lockout after max attempts

const store = new Map<string, AttemptRecord>();

export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  lockRemainingSeconds?: number;
} {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.resetAt <= now) {
    store.set(key, { count: 1, lockedUntil: null, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (record.lockedUntil !== null) {
    if (record.lockedUntil > now) {
      return {
        allowed: false,
        lockRemainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      };
    }
    store.set(key, { count: 1, lockedUntil: null, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_MS;
    return { allowed: false, lockRemainingSeconds: Math.ceil(LOCK_MS / 1000) };
  }

  return { allowed: true };
}

export function resetLoginRateLimit(identifier: string) {
  store.delete(identifier.toLowerCase().trim());
}
