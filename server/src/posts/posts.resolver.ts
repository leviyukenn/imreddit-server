import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { createWriteStream } from 'fs';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { CommunityService } from 'src/communities/community.service';
import { ResponseErrorCode } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { IResponse } from 'src/response/response.dto';
import { RoleService } from 'src/role/role.service';
import { UsersService } from 'src/users/users.service';
import { createErrorResponse } from 'src/util/createErrors';
import { InputParameterValidator } from 'src/util/validators';
import { FindConditions, LessThan } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { v4 } from 'uuid';
import {
  CreateImagePostInput,
  CreateTextPostInput,
} from './dto/create-post.dto';
import { CreateCommentInput } from './dto/createComment.dto';
import { PaginatedPosts, PostResponse, UploadResponse } from './dto/post.dto';
import { Post, PostType } from './post.entity';
import { PostsService } from './posts.service';

@Resolver(Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly communityService: CommunityService,
    private readonly userService: UsersService,
    private readonly roleService: RoleService,
  ) {}

  // @ResolveField(() => String)
  // textSnippet(@Root() post: Post) {
  //   return post.text.slice(0, 50);
  // }

  @Query((returns) => PaginatedPosts, { name: 'userPosts' })
  async getUserPosts(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
    @Args('userName') userName: string,
  ): Promise<PaginatedPosts> {
    const options: FindManyOptions<Post> = {
      where: [
        { postType: PostType.TEXT_POST },
        { postType: PostType.IMAGE_POST },
      ],
      order: { createdAt: 'DESC' },
      relations: ['creator', 'ancestor', 'community'],
    };

    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = (options.where as FindConditions<Post>[]).map(
        (condition) => ({
          ...condition,
          createdAt: LessThan(new Date(parseInt(cursor))),
        }),
      );
    }

    const user = await this.userService.findByUserName(userName);
    if (!user) throw new Error('no such user');
    options.where = (options.where as FindConditions<Post>[]).map(
      (condition) => ({
        ...condition,
        creator: { id: user.id },
      }),
    );

    const posts = await this.postsService.find(options);

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => PaginatedPosts, { name: 'communityPosts' })
  async getCommunityPosts(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
    @Args('communityName') communityName: string,
  ): Promise<PaginatedPosts> {
    const options: FindManyOptions<Post> = {
      where: [
        { postType: PostType.TEXT_POST },
        { postType: PostType.IMAGE_POST },
      ],
      order: { createdAt: 'DESC' },
      relations: ['creator', 'ancestor', 'community'],
    };

    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = (options.where as FindConditions<Post>[]).map(
        (condition) => ({
          ...condition,
          createdAt: LessThan(new Date(parseInt(cursor))),
        }),
      );
    }

    const community = await this.communityService.findByName(communityName);
    if (!community) throw Error('no such commnunity');
    options.where = (options.where as FindConditions<Post>[]).map(
      (condition) => ({
        ...condition,
        community: { id: community.id },
      }),
    );

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
      where: [
        { postType: PostType.TEXT_POST },
        { postType: PostType.IMAGE_POST },
      ],
      order: { createdAt: 'DESC' },
      relations: ['creator', 'ancestor', 'community'],
    };

    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = (options.where as FindConditions<Post>[]).map(
        (condition) => ({
          ...condition,
          createdAt: LessThan(new Date(parseInt(cursor))),
        }),
      );
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
      where: [
        { postType: PostType.TEXT_POST },
        { postType: PostType.IMAGE_POST },
      ],
      order: { createdAt: 'DESC' },
      relations: ['creator', 'ancestor', 'community'],
    };

    const posts = await this.postsService.find(options);

    return posts;
  }

  @Query((returns) => Post, { nullable: true })
  async postDetail(@Args('postId') postId: string) {
    return this.postsService.findOne(postId);
  }

  @Mutation((returns) => PostResponse)
  @UseGuards(isAuth)
  async createTextPost(
    @Args('createTextPostInput') createTextPostInput: CreateTextPostInput,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Post>> {
    const { title, text, communityId } = createTextPostInput;
    const validator = InputParameterValidator.object()
      .validatePostTitle(title)
      .validatePostText(text);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    const community = await this.communityService.findById(communityId);
    if (!community) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0014,
      });
    }
    const userCommunityRole = await this.roleService.findByUserIdAndCommunityId(
      req.session.userId!,
      communityId,
    );
    if (!userCommunityRole?.isMember) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0024,
      });
    }
    const post = await this.postsService.createTextPost({
      ...createTextPostInput,
      creatorId: req.session.userId!,
    });

    return { data: post };
  }

  @Mutation((returns) => PostResponse)
  @UseGuards(isAuth)
  async createImagePost(
    @Args('createImagePostInput') createImagePostInput: CreateImagePostInput,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Post>> {
    const { title, communityId } = createImagePostInput;
    const validator = InputParameterValidator.object().validatePostTitle(title);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    const community = await this.communityService.findById(communityId);
    if (!community) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0014,
      });
    }
    const userCommunityRole = await this.roleService.findByUserIdAndCommunityId(
      req.session.userId!,
      communityId,
    );
    if (!userCommunityRole?.isMember) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0024,
      });
    }
    const post = await this.postsService.createImagePost({
      ...createImagePostInput,
      creatorId: req.session.userId!,
    });

    return { data: post };
  }

  @Mutation((returns) => PostResponse)
  @UseGuards(isAuth)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Post>> {
    const { text, communityId, parentId, ancestorId } = createCommentInput;
    const validator = InputParameterValidator.object().validatePostText(text);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    const parentPost = await this.postsService.findOne(parentId);
    const ancestorPost = await this.postsService.findOne(ancestorId);
    if (!parentPost || !ancestorPost) {
      return createErrorResponse({
        field: 'post',
        errorCode: ResponseErrorCode.ERR0025,
      });
    }

    const community = await this.communityService.findById(communityId);
    if (!community) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0014,
      });
    }
    const userCommunityRole = await this.roleService.findByUserIdAndCommunityId(
      req.session.userId!,
      communityId,
    );
    if (!userCommunityRole?.isMember) {
      return createErrorResponse({
        field: 'communityId',
        errorCode: ResponseErrorCode.ERR0024,
      });
    }
    const post = await this.postsService.createComment({
      ...createCommentInput,
      creatorId: req.session.userId!,
    });

    return { data: post };
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
