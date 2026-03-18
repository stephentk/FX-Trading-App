import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const client = new Redis({
      host: configService.get('REDIS_HOST', '127.0.0.1'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get('REDIS_PASSWORD'),
    });

    client.on('connect', () => console.log('✅ Redis connected'));
    client.on('error', (err) => console.error('❌ Redis error:', err));

    return client;
  },
};