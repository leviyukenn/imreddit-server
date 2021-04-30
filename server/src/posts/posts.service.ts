import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { CreatePostInput } from './dto/create-post.dto';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor() {}

  createPost(
    createPostInput: CreatePostInput & { creatorId: string },
  ): Promise<Post> {
    return Post.create(createPostInput).save();
  }

  async find(options?: FindManyOptions<Post>): Promise<Post[]> {
    return Post.find(options);
  }

  findOne(id: string): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await Post.delete(id);
  }
}
