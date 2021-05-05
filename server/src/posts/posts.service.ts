import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { CreatePostInput } from './dto/create-post.dto';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor() {}

  async createPost(
    createPostInput: CreatePostInput & { creatorId: string },
  ): Promise<Post | undefined> {
    const savedPost = await Post.create(createPostInput).save();
    const post = await Post.findOne(savedPost.id, { relations: ['creator'] });
    console.log(post);
    return post;
  }

  async find(options?: FindManyOptions<Post>): Promise<Post[]> {
    return Post.find(options);
  }

  findOne(postId: string): Promise<Post | undefined> {
    return Post.findOne(postId, { relations: ['creator'] });
  }

  async remove(id: string): Promise<void> {
    await Post.delete(id);
  }
}
