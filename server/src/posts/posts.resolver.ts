import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { createWriteStream } from 'fs';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { isAuth } from 'src/guards/isAuth';
import { IsNull, LessThan } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { v4 } from 'uuid';
import { CreatePostInput } from './dto/create-post.dto';
import { PaginatedPosts, UploadResponse } from './dto/post.dto';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

@Resolver(Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  // @ResolveField(() => String)
  // textSnippet(@Root() post: Post) {
  //   return post.text.slice(0, 50);
  // }

  @Query((returns) => PaginatedPosts, { name: 'posts' })
  async getPosts(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
  ): Promise<PaginatedPosts> {
    const options: FindManyOptions<Post> = {
      where: { parent: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'parent'],
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

  @Query((returns) => Post, { nullable: true })
  async postDetail(@Args('postId') postId: string) {
    return this.postsService.findOne(postId);
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

  @Mutation(() => UploadResponse)
  async uploadImage(
    @Args({ name: 'image', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<UploadResponse> {
    if (!mimetype.includes('image/'))
      return {
        errors: [{ field: 'uploadImage', message: 'only accept images.' }],
      };

    const imageType = mimetype.replace('image/', '');
    const fileName = `${v4()}.${imageType}`;
    const filePath = `public/resources/uploadedImages/${fileName}`;
    const url = filePath.replace('public', '');

    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(filePath))
        .on('finish', () => resolve({ url }))
        .on('error', () =>
          reject({
            errors: [
              { field: 'uploadImage', message: 'uploading image failed' },
            ],
          }),
        ),
    );
  }
}
