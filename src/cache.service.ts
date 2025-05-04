import { Redis, RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveService } from '@furkanogutcu/nest-sensitive';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly client: Redis;

  constructor(
    private readonly sensitiveService: SensitiveService,
    private readonly redisService: RedisService,
  ) {
    this.client = this.redisService.getClient();
  }

  async get<T = string | object | null>(key: string, options?: { decrypt?: boolean }): Promise<T> {
    const value = await this.client.get(key);

    if (!value) return value as T;

    const result = options?.decrypt ? this.sensitiveService.decrypt(value) : value;

    try {
      return JSON.parse(result) as T;
    } catch {
      return result as T;
    }
  }

  async set(key: string, data: unknown, options?: { ttl?: number; encrypt?: boolean }): Promise<string> {
    const value = options?.encrypt ? this.sensitiveService.encrypt(data) : JSON.stringify(data);

    return options?.ttl !== undefined
      ? await this.client.setex(key, options.ttl, value)
      : await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async deleteAllMatched(keys: string[]): Promise<void> {
    const commands = [];

    for (const key of keys) {
      const cachedKeys = await this.keys(key);
      if (cachedKeys.length > 0) commands.push(cachedKeys.map((ckey) => ['del', ckey]));
    }

    if (commands.length > 0) await this.client.multi(commands.flat(1)).exec();
  }

  async flushAll(): Promise<string> {
    return await this.client.flushall();
  }
}
