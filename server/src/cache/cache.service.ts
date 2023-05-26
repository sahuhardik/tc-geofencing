import { Injectable } from '@nestjs/common';
import { InjectRedis, DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(
    @InjectRedis(DEFAULT_REDIS_NAMESPACE) private readonly client: Redis,
  ) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async mget(keys: string[]): Promise<string[]> {
    return this.client.mget(keys);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      this.client.set(key, value, 'EX', ttl);
    } else {
      this.client.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    this.client.del(key);
  }
}
