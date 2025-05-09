import { RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveService } from '@furkanogutcu/nest-sensitive';
import { Provider } from '@nestjs/common';

import { CacheKeyConfig } from './cache-key-config.interface';

export interface RedisOptions {
  url: string;
  [key: string]: any;
}

export interface SensitiveOptions {
  encryptionKey: string;
  [key: string]: any;
}

export interface CacheModuleOptions {
  redis: RedisService | RedisOptions;
  sensitive: SensitiveService | SensitiveOptions;
  cacheKeyConfig?: Partial<CacheKeyConfig>;
  isGlobal?: boolean;
}

export interface CacheModuleAsyncOptions {
  imports?: any[];
  useFactory?: (...args: any[]) => Promise<CacheModuleOptions> | CacheModuleOptions;
  inject?: any[];
  providers?: Provider[];
  isGlobal?: boolean;
}
