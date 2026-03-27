/**
 * Rate Limiting Utility
 * In-memory rate limiter with configurable limits
 */

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

export class RateLimiter {
  private config: RateLimitConfig;
  private keyPrefix: string;

  constructor(config: RateLimitConfig, keyPrefix: string = 'rl') {
    this.config = config;
    this.keyPrefix = keyPrefix;
  }

  private getKey(identifier: string): string {
    return `${this.keyPrefix}:${identifier}`;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }

  async check(identifier: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return {
        allowed: true,
        remaining: this.config.limit - 1,
        resetAt: now + this.config.windowMs,
      };
    }

    if (record.count >= this.config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.config.limit - record.count,
      resetAt: record.resetAt,
    };
  }

  async withRateLimit<T>(identifier: string, fn: () => Promise<T>): Promise<T> {
    const result = await this.check(identifier);
    
    if (!result.allowed) {
      const error = new Error('Rate limit exceeded');
      (error as any).code = 'RATE_LIMITED';
      (error as any).status = 429;
      (error as any).resetAt = result.resetAt;
      throw error;
    }

    return fn();
  }

  reset(identifier: string): void {
    const key = this.getKey(identifier);
    store.delete(key);
  }

  static cleanup() {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  api: new RateLimiter({ limit: 100, windowMs: 60000 }, 'api'),
  auth: new RateLimiter({ limit: 5, windowMs: 300000 }, 'auth'),
  export: new RateLimiter({ limit: 10, windowMs: 3600000 }, 'export'),
  upload: new RateLimiter({ limit: 20, windowMs: 3600000 }, 'upload'),
};

// Cleanup every hour
setInterval(() => RateLimiter.cleanup(), 3600000);
