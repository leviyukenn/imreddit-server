import * as redisStore from 'cache-manager-ioredis';
import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CacheModule.register({
    store: redisStore,
    host: 'localhost',
    port: 6379,
    db:0,
    
  }),],
  providers: [UsersService,UsersResolver],

})
export class UsersModule {}