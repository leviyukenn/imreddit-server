import { Field, ObjectType } from '@nestjs/graphql';
import { createTypedResponse } from 'src/response/response.dto';
import { Post } from '../post.entity';

@ObjectType()
export class PaginatedPosts {
  @Field((type) => [Post])
  posts!: Post[];

  @Field()
  hasMore!: boolean;
}

@ObjectType()
export class UploadResponse extends createTypedResponse(String, 'path') {}
