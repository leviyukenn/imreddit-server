import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigKeys } from 'src/config/configKeys';
import { RedisCacheService } from './redisCache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get(ConfigKeys.REDIS_SERVER),
        port: configService.get(ConfigKeys.REDIS_SERVER_PORT),
        password: configService.get(ConfigKeys.REDIS_SERVER_PASSWORD),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
