import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';

import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { UpdatePostInput } from './dto/update-post.dto';
import { CreatePostInput } from './dto/create-post.dto';
import { isAuth } from 'src/guards/isAuth';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}
  @Query((returns) => [Post], { name: 'posts' })
  async getPosts() {
    return this.postsService.findAll();
  }

  @Mutation((returns) => Post)
  @UseGuards(isAuth)
  async createPost(@Args('createPostInput') createPostInput: CreatePostInput) {
    return this.postsService.createPost({
      ...createPostInput,
      creatorId: 'd4067b74-565e-4165-b494-832691e8e60d',
    });
  }

  // @Mutation((returns) => Post, { nullable: true })
  // async updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
  //   const { id, title } = updatePostInput;
  //   const post = await this.postsService
  //     .findOne(id)
  //     .catch(() => console.log('查找post出错'));
  //   if (!post) {
  //     return null;
  //   }

  //   if (typeof title !== 'undefined') {
  //     post.title = title;
  //   }

  //   return this.postsService.save(post);
  // }

  @Mutation((returns) => Boolean)
  async deletePost(@Args({ name: 'id', type: () => String }) id: string) {
    let deleteSuccess = true;
    await this.postsService.remove(id).catch(() => {
      deleteSuccess = false;
    });
    return deleteSuccess;
  }
}
