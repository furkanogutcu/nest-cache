import { RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveService } from '@furkanogutcu/nest-sensitive';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { CacheService } from './cache.service';
import { CACHE_MODULE_OPTIONS } from './constants/cache.constants';
import { CacheModuleAsyncOptions, CacheModuleOptions } from './interfaces/cache-module-options.interface';

@Module({})
export class CacheModule {
  static register(options: CacheModuleOptions = {}): DynamicModule {
    const providers: Provider[] = [];

    if (options.redisService) {
      providers.push({
        provide: RedisService,
        useValue: options.redisService,
      });
    } else if (options.redisOptions) {
      providers.push({
        provide: RedisService,
        useFactory: () => new RedisService(options.redisOptions as any),
      });
    } else {
      providers.push({
        provide: RedisService,
        useFactory: () => {
          throw new Error('RedisService must be provided either directly or via redisOptions');
        },
      });
    }

    if (options.sensitiveService) {
      providers.push({
        provide: SensitiveService,
        useValue: options.sensitiveService,
      });
    } else if (options.sensitiveOptions) {
      providers.push({
        provide: SensitiveService,
        useFactory: () => new SensitiveService(options.sensitiveOptions as any),
      });
    } else {
      providers.push({
        provide: SensitiveService,
        useFactory: () => {
          throw new Error('SensitiveService must be provided either directly or via sensitiveOptions');
        },
      });
    }

    providers.push({
      provide: CacheService,
      useFactory: (sensitiveService: SensitiveService, redisService: RedisService) => {
        return new CacheService(sensitiveService, redisService);
      },
      inject: [SensitiveService, RedisService],
    });

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
        provide: RedisService,
        useFactory: (cacheModuleOptions: CacheModuleOptions) => {
          if (cacheModuleOptions.redisService) {
            return cacheModuleOptions.redisService;
          }

          if (cacheModuleOptions.redisOptions) {
            return new RedisService(cacheModuleOptions.redisOptions);
          }

          throw new Error('RedisService must be provided either directly or via redisOptions');
        },
        inject: [CACHE_MODULE_OPTIONS],
      },
      {
        provide: SensitiveService,
        useFactory: (cacheModuleOptions: CacheModuleOptions) => {
          if (cacheModuleOptions.sensitiveService) {
            return cacheModuleOptions.sensitiveService;
          }

          if (cacheModuleOptions.sensitiveOptions) {
            return new SensitiveService(cacheModuleOptions.sensitiveOptions);
          }

          throw new Error('SensitiveService must be provided either directly or via sensitiveOptions');
        },
        inject: [CACHE_MODULE_OPTIONS],
      },
      {
        provide: CacheService,
        useFactory: (sensitiveService: SensitiveService, redisService: RedisService) => {
          return new CacheService(sensitiveService, redisService);
        },
        inject: [SensitiveService, RedisService],
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
