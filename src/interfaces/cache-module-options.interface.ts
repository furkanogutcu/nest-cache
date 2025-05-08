import { RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveService } from '@furkanogutcu/nest-sensitive';
import { Provider } from '@nestjs/common';

export interface RedisOptions {
  url: string;
  [key: string]: any;
}

export interface SensitiveOptions {
  encryptionKey: string;
  [key: string]: any;
}

export interface CacheModuleOptions {
  redisService?: RedisService;
  sensitiveService?: SensitiveService;
  redisOptions?: RedisOptions;
  sensitiveOptions?: SensitiveOptions;
  isGlobal?: boolean;
}

export interface CacheModuleAsyncOptions {
  imports?: any[];
  useFactory?: (...args: any[]) => Promise<CacheModuleOptions> | CacheModuleOptions;
  inject?: any[];
  providers?: Provider[];
  isGlobal?: boolean;
}
