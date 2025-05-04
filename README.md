# nest-cache

[![npm version](https://img.shields.io/npm/v/@furkanogutcu/nest-cache.svg)](https://www.npmjs.com/package/@furkanogutcu/nest-cache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Redis-based caching module for NestJS applications with sensitive data encryption support.

## Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [Development](#development)
- [License](#license)

## Installation

```bash
npm install @furkanogutcu/nest-cache
```

or

```bash
yarn add @furkanogutcu/nest-cache
```

## Features

- Redis-based caching solution for NestJS applications
- Encryption/Decryption support for sensitive data
- Configurable cache key generation with prefixes and separators
- Asynchronous module initialization
- TypeScript support with strong typing

## Usage

### Registration

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@furkanogutcu/nest-cache';

@Module({
  imports: [
    CacheModule.register({
      redis: {
        url: 'redis://localhost:6379',
      },
      sensitive: {
        encryptionKey: 'your-encryption-secret',
      },
      cacheKeyConfig: {
        prefix: 'my-app',
        separator: ':',
      },
      isGlobal: true, // Optional: Make the module global
    }),
  ],
})
export class AppModule {}
```

### Async Module Registration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@furkanogutcu/nest-cache';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          url: configService.get('REDIS_URL'),
        },
        sensitive: {
          encryptionKey: configService.get('ENCRYPTION_KEY'),
        },
        cacheKeyConfig: {
          prefix: 'my-app',
          separator: ':',
        },
        isGlobal: true,
      }),
    }),
  ],
})
export class AppModule {}
```

### Using Existing Service Instances

```typescript
import { Module } from '@nestjs/common';
import { RedisModule, RedisService } from '@furkanogutcu/nest-redis';
import { SensitiveModule, SensitiveService } from '@furkanogutcu/nest-sensitive';
import { CacheModule } from '@furkanogutcu/nest-cache';

@Module({
  imports: [
    RedisModule.register({
      url: 'redis://localhost:6379',
    }),
    SensitiveModule.register({
      encryptionKey: 'your-encryption-secret',
    }),
    CacheModule.registerAsync({
      useFactory: (redisService: RedisService, sensitiveService: SensitiveService) => ({
        redis: redisService,
        sensitive: sensitiveService,
        cacheKeyConfig: {
          prefix: 'my-app',
          separator: ':',
        },
        isGlobal: true,
      }),
      inject: [RedisService, SensitiveService],
    }),
  ],
})
export class AppModule {}
```

### Using the Cache Service

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService, CacheKey } from '@furkanogutcu/nest-cache';

@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}

  async getUser(id: string) {
    // Create a cache key
    const cacheKey = CacheKey.generate('user', id);

    // Try to get data from cache
    let user = await this.cacheService.get(cacheKey, { decrypt: true });

    if (!user) {
      // Fetch from database if not in cache
      user = await this.fetchUserFromDatabase(id);

      // Store in cache with 1 hour TTL
      await this.cacheService.set(cacheKey, user, { ttl: 3600, encrypt: true });
    }

    return user;
  },

  ...
}
```

## Development

### Requirements

- Node.js 18+
- npm or yarn

### Getting Started

Clone the project

```bash
  git clone https://github.com/furkanogutcu/nest-cache.git
```

Go to the project directory

```bash
  cd nest-cache
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start:dev
```

## License

This project is licensed under the [MIT License](LICENSE).
