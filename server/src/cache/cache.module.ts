import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: 'localhost',
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
