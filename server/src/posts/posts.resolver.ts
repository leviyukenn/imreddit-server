import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
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
import { createWriteStream } from 'fs';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { CommunityService } from 'src/communities/community.service';
import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { isCreator } from 'src/guards/isCreator';
import { isPostModerator } from 'src/guards/isPostModerator';
import { IResponse } from 'src/response/response.dto';
import { RoleService } from 'src/role/role.service';
import { UpvotesService } from 'src/upvotes/upvotes.service';
import { UsersService } from 'src/users/users.service';
import { createErrorResponse } from 'src/util/createErrors';
import { getSubDateBasedOnOrderType } from 'src/util/getSubDateBasedOnOrderType';
import { InputParameterValidator } from 'src/util/validators';
import { FindConditions, In, LessThan, Not } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { v4 } from 'uuid';
import {
  CreateImagePostInput,
  CreateTextPostInput,
} from './dto/create-post.dto';
import { CreateCommentInput } from './dto/createComment.dto';
import {
  OrderType,
  PaginatedPosts,
  PostResponse,
  UploadResponse,
} from './dto/post.dto';
import { Post, PostStatus, PostType } from './post.entity';
import { PostsService } from './posts.service';

@Resolver(Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly communityService: CommunityService,
    private readonly userService: UsersService,
    private readonly roleService: RoleService,
    private readonly upvoteService: UpvotesService,
  ) {}

  @ResolveField(() => String)
  totalComments(@Root() post: Post) {
    return this.postsService.countAllPostComments(post.id);
  }
  @Query((returns) => [Post], { name: 'userComments' })
  async getUserComments(
    @Args('userName') userName: string,
    @Args('ancestorId') ancestorId: string,
  ): Promise<Post[]> {
    const user = await this.userService.findByUserName(userName);
    if (!user)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0029)!,
        HttpStatus.NOT_FOUND,
      );

    const comments = await this.postsService.findUserComments(
      user.id,
      ancestorId,
    );
    return comments;
  }

  @Query((returns) => PaginatedPosts, { name: 'userUpvotedPosts' })
  async getPostsUserUpvoted(
    @Args('userName') userName: string,
    //upvoteType: 1 for upvote, 0 for downvote
    @Args('upvoteType', { type: () => Int }) upvoteType: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
  ): Promise<PaginatedPosts> {
    const user = await this.userService.findByUserName(userName);
    if (!user)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0029)!,
        HttpStatus.NOT_FOUND,
      );

    if (!(upvoteType === 0 || upvoteType === 1))
      throw new Error('invalid upvoteType');
    const postIds = await this.upvoteService.findUserUpvotePost(
      user.id,
      upvoteType ? 1 : -1,
    );
    const options: FindManyOptions<Post> = {
      where: { id: In(postIds), postType: Not(PostType.COMMENT) },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'ancestor', 'community'],
    };

    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        createdAt: LessThan(new Date(parseInt(cursor))),
      };
    }

    const posts = await this.postsService.find(options);

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => PaginatedPosts, { name: 'userCommentedPosts' })
  async getPostsUserCommentedOn(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
    @Args('userName') userName: string,
  ): Promise<PaginatedPosts> {
    const user = await this.userService.findByUserName(userName);
    if (!user)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0029)!,
        HttpStatus.NOT_FOUND,
      );

    const postIds = await this.postsService.findAllPostsUserCommented(user.id);
    const options: FindManyOptions<Post> = {
      where: { id: In(postIds) },
      order: { createdAt: 'DESC' },
      relations: ['creator', 'ancestor', 'community'],
    };

    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        createdAt: LessThan(new Date(parseInt(cursor))),
      };
    }

    const posts = await this.postsService.find(options);

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => PaginatedPosts, { name: 'userPosts' })
  async getUserPosts(
    @Args('orderType', { type: () => Int, nullable: true }) orderType: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
    @Args('userName') userName: string,
  ): Promise<PaginatedPosts> {
    const user = await this.userService.findByUserName(userName);
    if (!user)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0029)!,
        HttpStatus.NOT_FOUND,
      );

    if (!(orderType in OrderType)) {
      orderType = OrderType.NEW;
    }

    let posts: Post[];
    if (orderType === OrderType.NEW) {
      posts = await this.postsService.findNewUserPosts(
        user.id,
        limit,
        cursor,
      );
    } else {
      const until = getSubDateBasedOnOrderType(orderType);
      posts = await this.postsService.findTopPointsUserPosts(
        until,
        user.id,
        limit,
        cursor,
      );
    }

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => PaginatedPosts, { name: 'communityPosts' })
  async getCommunityPosts(
    @Args('orderType', { type: () => Int, nullable: true }) orderType: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
    @Args('communityName') communityName: string,
  ): Promise<PaginatedPosts> {
    const community = await this.communityService.findByName(communityName);
    if (!community)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0014)!,
        HttpStatus.NOT_FOUND,
      );
    if (!(orderType in OrderType)) {
      orderType = OrderType.NEW;
    }

    let posts: Post[];
    if (orderType === OrderType.NEW) {
      posts = await this.postsService.findNewHomePosts(
        undefined,
        community.id,
        limit,
        cursor,
      );
    } else {
      const until = getSubDateBasedOnOrderType(orderType);
      posts = await this.postsService.findTopPointsHomePosts(
        until,
        undefined,
        community.id,
        limit,
        cursor,
      );
    }
    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => PaginatedPosts, { name: 'paginatedPosts' })
  async getPaginatedPosts(
    @Args('orderType', { type: () => Int, nullable: true }) orderType: number,
    @Args('userId', { type: () => String, nullable: true }) userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('cursor', { nullable: true }) cursor: string,
  ): Promise<PaginatedPosts> {
    if (!(orderType in OrderType)) {
      orderType = OrderType.NEW;
    }

    let posts: Post[];
    if (orderType === OrderType.NEW) {
      posts = await this.postsService.findNewHomePosts(
        userId,
        undefined,
        limit,
        cursor,
      );
    } else {
      const until = getSubDateBasedOnOrderType(orderType);
      posts = await this.postsService.findTopPointsHomePosts(
        until,
        userId,
        undefined,
        limit,
        cursor,
      );
    }

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query((returns) => [Post], { name: 'allPosts' })
  async getAllPosts(): Promise<Post[]> {
    const options: FindManyOptions<Post> = {
      where: {
        postType: Not(PostType.COMMENT),
        postStatus: Not(PostStatus.REMOVED),
      },
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
      layer: parentPost.layer + 1,
      creatorId: req.session.userId!,
    });

    return { data: post };
  }

  @Mutation((returns) => PostResponse)
  @UseGuards(isPostModerator)
  async changePostStatus(
    @Args('postId') postId: string,
    @Args('postStatus', { type: () => Int }) postStatus: number,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Post>> {
    if (!(postStatus in PostStatus)) {
      return createErrorResponse({
        field: 'postStatus',
        errorCode: ResponseErrorCode.ERR0034,
      });
    }

    const affected = await this.postsService.updatePostStatus(
      postId,
      postStatus,
    );

    if (!affected) {
      return createErrorResponse({
        field: 'postId',
        errorCode: ResponseErrorCode.ERR0035,
      });
    }

    const post = await this.postsService.findByUserIdWithRemovedPost(postId);

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

  @Mutation((returns) => String)
  @UseGuards(isCreator)
  async deleteMyPost(
    @Args({ name: 'postId', type: () => String }) postId: string,
    @Context() { req }: { req: Request },
  ): Promise<string> {
    const affected = await this.postsService.remove(postId).catch(() => {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0036)!,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    if (!affected) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0027)!,
        HttpStatus.NOT_MODIFIED,
      );
    }
    return postId;
  }

  @Mutation(() => UploadResponse)
  @UseGuards(isAuth)
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
