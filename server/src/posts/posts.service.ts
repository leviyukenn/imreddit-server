import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  save(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  findOne(id: number): Promise<Post> {
    return this.postsRepository.findOne(id);
  }

    async remove(id: number): Promise<void> {
      await this.postsRepository.delete(id);
    }
}
