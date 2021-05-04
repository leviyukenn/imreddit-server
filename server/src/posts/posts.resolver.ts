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
import { LessThan } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { CreatePostInput } from './dto/create-post.dto';
import { PaginatedPosts } from './dto/post.dto';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

@Resolver(Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @Query((returns) => PaginatedPosts, { name: 'posts' })
  async getPosts(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
  ): Promise<PaginatedPosts> {
    const options: FindManyOptions<Post> = {
      order: { createdAt: 'DESC' },
      relations: ['creator'],
    };
    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = {
        createdAt: LessThan(new Date(parseInt(cursor))),
      };
    }
    const posts = await this.postsService.find(options);

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
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
