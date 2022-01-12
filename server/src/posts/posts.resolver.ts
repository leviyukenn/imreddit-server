import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { createWriteStream } from 'fs';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { CommunityService } from 'src/communities/community.service';
import { ResponseErrorCode } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { IResponse } from 'src/response/response.dto';
import { createErrorResponse } from 'src/util/createErrors';
import { IsNull, LessThan } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { v4 } from 'uuid';
import { CreatePostInput } from './dto/create-post.dto';
import { PaginatedPosts, UploadResponse } from './dto/post.dto';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

@Resolver(Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly communityService: CommunityService,
  ) {}

  // @ResolveField(() => String)
  // textSnippet(@Root() post: Post) {
  //   return post.text.slice(0, 50);
  // }
  @Query((returns) => PaginatedPosts, { name: 'communityPosts' })
  async getCommunityPosts(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
    @Args('communityName') communityName: string,
  ): Promise<PaginatedPosts> {
    const options: FindManyOptions<Post> = {
      where: { parent: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'parent', 'community'],
    };

    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = {
        ...(options.where as Object),
        createdAt: LessThan(new Date(parseInt(cursor))),
      };
    }

    if (communityName) {
      const community = await this.communityService.findByName(communityName);
      if (!community) throw Error('no such commnunity');
      options.where = {
        ...(options.where as Object),
        community: { id: community.id },
      };
    }

    const posts = await this.postsService.find(options);

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => PaginatedPosts, { name: 'paginatedPosts' })
  async getPaginatedPosts(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
  ): Promise<PaginatedPosts> {
    const options: FindManyOptions<Post> = {
      where: { parent: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'parent', 'community'],
    };

    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = {
        ...(options.where as Object),
        createdAt: LessThan(new Date(parseInt(cursor))),
      };
    }

    const posts = await this.postsService.find(options);

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => [Post], { name: 'allPosts' })
  async getAllPosts(): Promise<Post[]> {
    const options: FindManyOptions<Post> = {
      where: { parent: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'parent', 'community'],
    };

    const posts = await this.postsService.find(options);

    return posts;
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
    //a post is not allowed to have no title
    if (!createPostInput.title && !createPostInput.parentId)
      throw new Error('illegal post.');

    //a comment is not allowed to have a title
    if (createPostInput.title && createPostInput.parentId)
      throw new Error('illegal post.');

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
  ): Promise<IResponse<String>> {
    //check if the uploaded file is a image.
    if (!mimetype.includes('image/')) {
      return createErrorResponse({
        field: 'file type',
        errorCode: ResponseErrorCode.ERR0001,
      });
    }

    const imageType = mimetype.replace('image/', '');
    const imageId = v4();
    const fileName = `${imageId}.${imageType}`;
    const filePath = `public/resources/uploadedImages/${fileName}`;
    const path = filePath.replace('public', '');

    return new Promise<IResponse<String>>((resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(filePath))
        .on('finish', () => resolve({ data: path }))
        .on('error', () => {
          reject(
            createErrorResponse({
              field: 'upload process',
              errorCode: ResponseErrorCode.ERR0002,
            }),
          );
        }),
    );
  }
}
