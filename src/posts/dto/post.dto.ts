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
export class PostResponse extends createTypedResponse(Post, 'post') {}

@ObjectType()
export class DeletePostResponse extends createTypedResponse(String, 'postId') {}

@ObjectType()
export class UploadResponse extends createTypedResponse(String, 'path') {}

export enum OrderType {
  NEW,
  TOP_1DAY,
  TOP_1WEEK,
  TOP_1MONTH,
  TOP_1YEAR,
  TOP_ALL_TIME,
}
