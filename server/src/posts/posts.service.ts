import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import {
  CreateImagePostInput,
  CreateTextPostInput,
} from './dto/create-post.dto';
import { CreateCommentInput } from './dto/createComment.dto';
import { Image } from './image.entity';
import { Post } from './post.entity';

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
        community: { id: createPostInput.communityId },
        creator: { id: createPostInput.creatorId },
      });

      const savedPost = await queryRunner.manager.save(newPost);

      await queryRunner.commitTransaction();
      const post = Post.findOne(savedPost.id);
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
      const post = Post.findOne(savedPost.id);
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
    createCommentInput: CreateCommentInput & { creatorId: string },
  ): Promise<Post | undefined> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newPost = await Post.create({
        ...createCommentInput,
        community: { id: createCommentInput.communityId },
        parent: { id: createCommentInput.parentId },
        ancestor: { id: createCommentInput.ancestorId },
        creator: { id: createCommentInput.creatorId },
      });

      const savedPost = await queryRunner.manager.save(newPost);

      await queryRunner.commitTransaction();
      const post = Post.findOne(savedPost.id);
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
      relations: ['children', 'community'],
    });
  }

  async remove(id: string): Promise<void> {
    await Post.delete(id);
  }
}
