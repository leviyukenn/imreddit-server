import { Module } from '@nestjs/common';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  providers: [PostsResolver, PostsService],
})
export class PostsModule {}
