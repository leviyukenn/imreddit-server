import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../post.entity';

@ObjectType()
export class PaginatedPosts {
  @Field((type) => [Post])
  posts!: Post[];

  @Field()
  hasMore!: boolean;
}
