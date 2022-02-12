import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Upvote } from './upvote.entity';
import { UpvotesResolver } from './upvotes.resolver';
import { UpvotesService } from './upvotes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Upvote]), UsersModule],
  providers: [UpvotesResolver, UpvotesService],
  exports: [UpvotesService],
})
export class UpvotesModule {}
