import { RedisConnectionOptions, RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveModuleOptions, SensitiveService } from '@furkanogutcu/nest-sensitive';
import { ModuleMetadata } from '@nestjs/common';

import { CacheKeyConfig } from './cache-key-config.interface';

export interface CacheModuleOptions {
  sensitive: SensitiveModuleOptions | SensitiveService;
  redis: RedisConnectionOptions | RedisService;
  isGlobal?: boolean;
  cacheKeyConfig?: CacheKeyConfig;
}

export interface CacheModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<CacheModuleOptions> | CacheModuleOptions;
  isGlobal?: boolean;
}
