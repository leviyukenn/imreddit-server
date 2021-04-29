import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { isAuth } from 'src/guards/isAuth';
import { CreatePostInput } from './dto/create-post.dto';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

@Resolver()
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}
  @Query((returns) => [Post], { name: 'posts' })
  async getPosts() {
    return this.postsService.findAll();
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
