import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Author } from './models/author.model';
import { Post } from 'src/posts/post.entity';

@Resolver(() => Author)
export class AuthorsResolver {
  @Query((returns) => Author, { name: 'author' })
  async getAuthor(@Args('id', { type: () => Int }) id: number) {
    return { id };
  }

  @ResolveField('posts', (returns) => [Post])
  async getPosts(@Parent() author: Author) {
    const { id } = author;
    return [{ id, title: 'genshin', votes: 10 }];
  }
}
