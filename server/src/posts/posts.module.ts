import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityModule } from 'src/communities/community.module';
import { UsersModule } from 'src/users/users.module';
import { Image } from './image.entity';
import { Post } from './post.entity';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Image]),
    CommunityModule,
    UsersModule,
    RoleModule,
  ],
  providers: [PostsResolver, PostsService],
})
export class PostsModule {}
