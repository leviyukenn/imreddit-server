import { Injectable } from '@nestjs/common';
import { Upvote } from 'src/upvotes/upvote.entity';
import { Connection, getManager } from 'typeorm';
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
  constructor(private connection: Connection) {}

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
}
