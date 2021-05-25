import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { CreatePostInput } from './dto/create-post.dto';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postTreeRepository: TreeRepository<Post>,
  ) {}

  async createPost(
    createPostInput: CreatePostInput & { creatorId: string },
  ): Promise<Post | undefined> {
    const savedPost = await Post.create({
      ...createPostInput,
      parent: { id: createPostInput.parentId },
      creator: { id: createPostInput.creatorId },
    }).save();
    const post = await Post.findOne(savedPost.id, { relations: ['creator'] });
    return post;
  }

  async find(options?: FindManyOptions<Post>): Promise<Post[]> {
    return Post.find(options);
  }

  async findOne(postId: string): Promise<Post | undefined> {
    return Post.findOne(postId, {
      relations: ['children'],
    });
  }

  async remove(id: string): Promise<void> {
    await Post.delete(id);
  }
}
