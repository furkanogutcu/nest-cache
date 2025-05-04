import { RedisModule, RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveModule, SensitiveService } from '@furkanogutcu/nest-sensitive';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { CacheService } from './cache.service';
import { CacheKey } from './cache-key';
import { CACHE_MODULE_OPTIONS, REDIS_SERVICE, SENSITIVE_SERVICE } from './constants/cache.constants';
import { CacheModuleAsyncOptions, CacheModuleOptions } from './interfaces/cache-module-options.interface';

@Module({})
export class CacheModule {
  static register(options: CacheModuleOptions): DynamicModule {
    if (options.cacheKeyConfig) {
      CacheKey.configure(options.cacheKeyConfig);
    }

    const imports = [];
    const providers: Provider[] = [
      {
        provide: CACHE_MODULE_OPTIONS,
        useValue: options,
      },
    ];

    if (options.sensitive instanceof SensitiveService) {
      providers.push({
        provide: SENSITIVE_SERVICE,
        useValue: options.sensitive,
      });
    } else {
      imports.push(SensitiveModule.register(options.sensitive));
      providers.push({
        provide: SENSITIVE_SERVICE,
        useExisting: SensitiveService,
      });
    }

    if (options.redis instanceof RedisService) {
      providers.push({
        provide: REDIS_SERVICE,
        useValue: options.redis,
      });
    } else {
      imports.push(
        RedisModule.register({
          connection: options.redis,
        }),
      );
      providers.push({
        provide: REDIS_SERVICE,
        useExisting: RedisService,
      });
    }

    providers.push({
      provide: CacheService,
      useFactory: (redisService: RedisService, sensitiveService: SensitiveService) => {
        return new CacheService(sensitiveService, redisService);
      },
      inject: [REDIS_SERVICE, SENSITIVE_SERVICE],
    });

    return {
      module: CacheModule,
      global: options.isGlobal || false,
      imports,
      providers,
      exports: [CacheService],
    };
  }

  static registerAsync(options: CacheModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    const providers: Provider[] = [...asyncProviders];
    const imports = [...(options.imports || [])];

    providers.push(
      {
        provide: REDIS_SERVICE,
        useFactory: (moduleOptions: CacheModuleOptions) => {
          if (moduleOptions.redis instanceof RedisService) {
            return moduleOptions.redis;
          }

          imports.push(
            RedisModule.register({
              connection: moduleOptions.redis,
            }),
          );
        },
        inject: [CACHE_MODULE_OPTIONS],
      },
      {
        provide: REDIS_SERVICE,
        useExisting: RedisService,
      },
      {
        provide: SENSITIVE_SERVICE,
        useFactory: (moduleOptions: CacheModuleOptions) => {
          if (moduleOptions.sensitive instanceof SensitiveService) {
            return moduleOptions.sensitive;
          }

          imports.push(SensitiveModule.register(moduleOptions.sensitive));
        },
        inject: [CACHE_MODULE_OPTIONS],
      },
      {
        provide: SENSITIVE_SERVICE,
        useExisting: SensitiveService,
      },
      {
        provide: CacheService,
        useFactory: (redisService: RedisService, sensitiveService: SensitiveService) => {
          return new CacheService(sensitiveService, redisService);
        },
        inject: [REDIS_SERVICE, SENSITIVE_SERVICE],
      },
    );

    return {
      module: CacheModule,
      global: options.isGlobal,
      imports,
      providers,
      exports: [CacheService],
    };
  }

  private static createAsyncProviders(options: CacheModuleAsyncOptions): Provider[] {
    return [
      {
        provide: CACHE_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => {
          const moduleOptions = await options.useFactory(...args);

          if (moduleOptions.cacheKeyConfig) {
            CacheKey.configure(moduleOptions.cacheKeyConfig);
          }

          return moduleOptions;
        },
        inject: options.inject || [],
      },
    ];
  }
}
