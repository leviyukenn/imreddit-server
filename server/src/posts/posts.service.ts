import { Injectable } from '@nestjs/common';
import { Community } from 'src/communities/community.entity';
import { CommunityService } from 'src/communities/community.service';
import { Upvote } from 'src/upvotes/upvote.entity';
import {
  Between,
  Connection,
  FindConditions,
  getManager,
  In,
  LessThan,
  LessThanOrEqual,
  Not,
} from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import {
  CreateImagePostInput,
  CreateTextPostInput,
} from './dto/create-post.dto';
import { CreateCommentInput } from './dto/createComment.dto';
import { Image } from './image.entity';
import { Post, PostStatus, PostType } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    private connection: Connection,
    private readonly communityService: CommunityService,
  ) {}

  async createTextPost(
    createPostInput: CreateTextPostInput & { creatorId: string },
  ): Promise<Post | undefined> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newPost = await Post.create({
        ...createPostInput,
        postType: PostType.TEXT_POST,
        community: { id: createPostInput.communityId },
        creator: { id: createPostInput.creatorId },
      });

      const savedPost = await queryRunner.manager.save(newPost);

      await queryRunner.commitTransaction();
      const post = this.findOne(savedPost.id);
      return post;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async createImagePost(
    createPostInput: CreateImagePostInput & { creatorId: string },
  ): Promise<Post | undefined> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newPost = await Post.create({
        ...createPostInput,
        postType: PostType.IMAGE_POST,
        community: { id: createPostInput.communityId },
        creator: { id: createPostInput.creatorId },
      });

      const savedPost = await queryRunner.manager.save(newPost);

      createPostInput.images.forEach(async (img) => {
        const newImage = await Image.create({
          ...img,
          post: { id: savedPost.id },
        });
        await queryRunner.manager.save(newImage);
      });

      await queryRunner.commitTransaction();
      const post = this.findOne(savedPost.id);
      return post;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async createComment(
    createCommentInput: CreateCommentInput & {
      creatorId: string;
      layer: number;
    },
  ): Promise<Post | undefined> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newPost = await Post.create({
        ...createCommentInput,
        postType: PostType.COMMENT,
        layer: createCommentInput.layer,
        community: { id: createCommentInput.communityId },
        parent: { id: createCommentInput.parentId },
        ancestor: { id: createCommentInput.ancestorId },
        creator: { id: createCommentInput.creatorId },
      });

      const savedPost = await queryRunner.manager.save(newPost);

      await queryRunner.commitTransaction();
      const post = this.findOne(savedPost.id);
      return post;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async find(options?: FindManyOptions<Post>): Promise<Post[]> {
    return Post.find(options);
  }

  async findOne(postId: string): Promise<Post | undefined> {
    return Post.findOne(postId, {
      relations: ['creator', 'children', 'community', 'ancestor'],
    });
  }

  async findByUserIdWithRemovedPost(postId: string): Promise<Post | undefined> {
    return Post.findOne(postId, {
      relations: ['creator', 'children', 'community', 'ancestor'],
    });
  }

  async countAllPostComments(postId: string): Promise<number> {
    return Post.count({ where: { ancestor: { id: postId } } });
  }

  async remove(id: string): Promise<number | null | undefined> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const comments = await this.find({ where: { ancestor: { id } } });
      if (comments.length !== 0) {
        const commentIds = comments.map((comment) => ({ id: comment.id }));
        const commentPostIds = comments.map((comment) => ({
          postId: comment.id,
        }));
        await queryRunner.manager.delete(Upvote, commentPostIds);
        await queryRunner.manager.delete(Post, commentIds);
      }

      await queryRunner.manager.delete(Upvote, { postId: id });
      await queryRunner.manager.delete(Image, { post: { id } });
      const { affected } = await queryRunner.manager.delete(Post, { id });

      await queryRunner.commitTransaction();
      return affected;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async findAllPostsUserCommented(userId: string): Promise<string[]> {
    const rawPosts: {
      [key: string]: any;
    }[] = await getManager()
      .createQueryBuilder(Post, 'post')
      .distinctOn(['post.ancestorId'])
      .where('post.creatorId = :userId', { userId })
      .andWhere('post.postType =:postType', { postType: 2 })
      .getRawMany();

    return rawPosts.map((post) => post.post_ancestorId as string);
  }

  async findUserComments(userId: string, ancestorId: string): Promise<Post[]> {
    const comments = Post.find({
      relations: ['ancestor', 'creator'],
      where: { ancestor: { id: ancestorId }, creator: { id: userId } },
    });
    return comments;
  }

  async updatePostStatus(
    postId: string,
    postStatus: PostStatus,
  ): Promise<number | undefined> {
    const result = await this.connection
      .createQueryBuilder()
      .update(Post)
      .set({ postStatus })
      .where('id = :postId', {
        postId,
      })
      .execute();

    return result.affected;
  }

  async findTopPointsPaginatedPosts(
    options: FindManyOptions<Post>,
    limit?: number,
    cursor?: string,
  ) {
    options.order = { points: 'DESC' };

    if (limit) {
      options.take = limit + 1;
    }

    if (cursor) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        points: LessThanOrEqual(parseInt(cursor)),
      };
    }

    return Post.find(options);
  }

  async findNewPaginatedPosts(
    options: FindManyOptions<Post>,
    limit?: number,
    cursor?: string,
  ) {
    options.order = { createdAt: 'DESC' };
    if (limit) {
      options.take = limit + 1;
    }
    if (cursor) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        createdAt: LessThan(new Date(parseInt(cursor))),
      };
    }
    console.log(options);

    return Post.find(options);
  }

  async findNewHomePosts(
    userId?: string,
    communityId?: string,
    limit?: number,
    cursor?: string,
  ) {
    const options: FindManyOptions<Post> = {
      where: {
        postType: Not(PostType.COMMENT),
        postStatus: Not(PostStatus.REMOVED),
      },
      relations: ['creator', 'ancestor', 'community'],
    };

    if (communityId) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        community: { id: communityId },
      };
    }

    if (userId && !communityId) {
      const communitiesUserJoined = await this.communityService
        .findByUserId(userId)
        .catch(() => [] as Community[]);
      const communityIdsUserJoined = communitiesUserJoined.map(
        (community) => community.id,
      );
      if (communityIdsUserJoined.length !== 0) {
        options.where = {
          ...(options.where as FindConditions<Post>),
          community: { id: In(communityIdsUserJoined) },
        };
      }
    }

    return this.findNewPaginatedPosts(options, limit, cursor);
  }

  async findNewUserPosts(userId?: string, limit?: number, cursor?: string) {
    const options: FindManyOptions<Post> = {
      where: { postType: Not(PostType.COMMENT), creator: { id: userId } },
      relations: ['creator', 'ancestor', 'community'],
    };

    return this.findNewPaginatedPosts(options, limit, cursor);
  }

  async findTopPointsHomePosts(
    until?: Date,
    userId?: string,
    communityId?: string,
    limit?: number,
    cursor?: string,
  ) {
    const options: FindManyOptions<Post> = {
      where: {
        postType: Not(PostType.COMMENT),
        postStatus: Not(PostStatus.REMOVED),
      },
      relations: ['creator', 'ancestor', 'community'],
    };
    if (until) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        createdAt: Between(until, new Date()),
      };
    }

    if (communityId) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        community: { id: communityId },
      };
    }

    if (userId && !communityId) {
      const communitiesUserJoined = await this.communityService
        .findByUserId(userId)
        .catch(() => [] as Community[]);
      const communityIdsUserJoined = communitiesUserJoined.map(
        (community) => community.id,
      );
      if (communityIdsUserJoined.length !== 0) {
        options.where = {
          ...(options.where as FindConditions<Post>),
          community: { id: In(communityIdsUserJoined) },
        };
      }
    }

    return this.findTopPointsPaginatedPosts(options, limit, cursor);
  }

  async findTopPointsUserPosts(
    until?: Date,
    userId?: string,
    limit?: number,
    cursor?: string,
  ) {
    const options: FindManyOptions<Post> = {
      where: { postType: Not(PostType.COMMENT), creator: { id: userId } },
      relations: ['creator', 'ancestor', 'community'],
    };
    if (until) {
      options.where = {
        ...(options.where as FindConditions<Post>),
        createdAt: Between(until, new Date()),
      };
    }

    return this.findTopPointsPaginatedPosts(options, limit, cursor);
  }
}
