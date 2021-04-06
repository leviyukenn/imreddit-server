import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';

import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { UpdatePostInput } from './dto/update-post.dto';
import { CreatePostInput } from './dto/create-post.dto';

@Resolver()
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}
  @Query((returns) => [Post], { name: 'posts' })
  async getPosts() {
    return this.postsService.findAll();
  }

  @Mutation((returns) => Post)
  async createPost(@Args('createPostInput') createPostInput: CreatePostInput) {
    const post = new Post();
    post.title = createPostInput.title;
    return this.postsService.save(post);
  }

  @Mutation((returns) => Post, { nullable: true })
  async updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    const { id, title } = updatePostInput;
    const post = await this.postsService
      .findOne(id)
      .catch(() => console.log('查找post出错'));
    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      post.title = title;
    }

    return this.postsService.save(post);
  }

  @Mutation((returns) => Boolean)
  async deletePost(@Args({ name: 'id', type: () => Int }) id: number) {
    let deleteSuccess = true;
    await this.postsService.remove(id).catch(() => {
      deleteSuccess = false;
    });
    return deleteSuccess;
  }
}
