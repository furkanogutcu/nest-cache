import { RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveService } from '@furkanogutcu/nest-sensitive';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { CacheService } from './cache.service';
import { CacheKey } from './cache-key';
import { CACHE_MODULE_OPTIONS } from './constants/cache.constants';
import { CacheModuleAsyncOptions, CacheModuleOptions } from './interfaces/cache-module-options.interface';

@Module({})
export class CacheModule {
  static register(options: CacheModuleOptions): DynamicModule {
    if (options.cacheKeyConfig) {
      CacheKey.configure(options.cacheKeyConfig);
    }

    const providers: Provider[] = [
      {
        provide: CACHE_MODULE_OPTIONS,
        useValue: options,
      },
      {
        provide: CacheService,
        useFactory: () => {
          let redisService: RedisService;
          let sensitiveService: SensitiveService;

          if (!options.redis) {
            throw new Error('Redis configuration must be provided');
          }

          if (options.redis instanceof RedisService) {
            redisService = options.redis;
          } else {
            redisService = new RedisService(options.redis);
          }

          if (!options.sensitive) {
            throw new Error('Sensitive configuration must be provided');
          }

          if (options.sensitive instanceof SensitiveService) {
            sensitiveService = options.sensitive;
          } else {
            sensitiveService = new SensitiveService(options.sensitive);
          }

          return new CacheService(sensitiveService, redisService);
        },
      },
    ];

    return {
      module: CacheModule,
      providers,
      exports: [CacheService],
      global: options.isGlobal ?? false,
    };
  }

  static registerAsync(options: CacheModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      ...(options.providers || []),
      {
        provide: CACHE_MODULE_OPTIONS,
        useFactory: options.useFactory || (() => ({})),
        inject: options.inject || [],
      },
      {
        provide: CacheService,
        useFactory: (moduleOptions: CacheModuleOptions) => {
          if (moduleOptions.cacheKeyConfig) {
            CacheKey.configure(moduleOptions.cacheKeyConfig);
          }

          let redisService: RedisService;
          let sensitiveService: SensitiveService;

          if (!moduleOptions.redis) {
            throw new Error('Redis configuration must be provided');
          }

          if (moduleOptions.redis instanceof RedisService) {
            redisService = moduleOptions.redis;
          } else {
            redisService = new RedisService(moduleOptions.redis);
          }

          if (!moduleOptions.sensitive) {
            throw new Error('Sensitive configuration must be provided');
          }

          if (moduleOptions.sensitive instanceof SensitiveService) {
            sensitiveService = moduleOptions.sensitive;
          } else {
            sensitiveService = new SensitiveService(moduleOptions.sensitive);
          }

          return new CacheService(sensitiveService, redisService);
        },
        inject: [CACHE_MODULE_OPTIONS],
      },
    ];

    return {
      module: CacheModule,
      imports: options.imports || [],
      providers,
      exports: [CacheService],
      global: options.isGlobal ?? false,
    };
  }
}
