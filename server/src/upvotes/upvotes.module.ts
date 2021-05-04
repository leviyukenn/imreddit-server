import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from 'src/posts/posts.module';
import { Upvote } from './upvote.entity';
import { UpvotesResolver } from './upvotes.resolver';
import { UpvotesService } from './upvotes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Upvote])],
  providers: [UpvotesResolver, UpvotesService],
})
export class UpvotesModule {}
