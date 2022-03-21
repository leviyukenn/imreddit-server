import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get(key: string) {
    return this.cache.get<string>(key);
  }

  async set(key: string, value: string, options?: CachingConfig) {
    this.cache.set(key, value, options);
  }

  async del(key: string) {
    this.cache.del(key);
  }
}
