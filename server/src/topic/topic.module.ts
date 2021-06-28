import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Topic } from './topic.entity';
import { TopicResolver } from './topic.resolver';
import { TopicService } from './topic.service';

@Module({
  imports: [TypeOrmModule.forFeature([Topic]), UsersModule],
  providers: [TopicResolver, TopicService],
})
export class TopicModule {}
