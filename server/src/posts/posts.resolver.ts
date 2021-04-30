import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { Request } from 'express';
import { isAuth } from 'src/guards/isAuth';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { CreatePostInput } from './dto/create-post.dto';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

@Resolver(Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField(() => String)
  textSnippet(@Root() post: Post) {
    console.log(post);
    return post.title.slice(0, 50);
  }

  @Query((returns) => [Post], { name: 'posts' })
  async getPosts(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
  ) {
    const options: FindManyOptions<Post> = {};
    if (limit) {
      options.take = limit;
    }

    return this.postsService.find(options);
  }

  @Mutation((returns) => Post)
  @UseGuards(isAuth)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @Context() { req }: { req: Request },
  ) {
    return this.postsService.createPost({
      ...createPostInput,
      creatorId: req.session.userId!,
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
