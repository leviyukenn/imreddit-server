import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor() {}

  save(post: Post): Promise<Post> {
    return Post.save(post);
  }

  async findAll(): Promise<Post[]> {
    return Post.find();
  }

  findOne(id: string): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await Post.delete(id);
  }
}
