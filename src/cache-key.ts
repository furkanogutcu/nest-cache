import crypto from 'crypto';

import { CacheKeyConfig } from './interfaces/cache-key-config.interface';

export class CacheKey {
  private static _config: CacheKeyConfig = {
    separator: ':',
  };

  static configure(config: Partial<CacheKeyConfig>): void {
    this._config = { ...this._config, ...config };
  }

  static get config(): CacheKeyConfig {
    return { ...this._config };
  }

  static generate(...segments: string[]): string {
    const separator = this._config.separator;

    if (this._config.prefix) {
      segments.unshift(this._config.prefix);
    }

    return segments.join(separator);
  }

  static createHash(data: string, length = 16): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, length);
  }
}
