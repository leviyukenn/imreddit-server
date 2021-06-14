import { Field, ObjectType } from '@nestjs/graphql';
import { Response } from '../../response/response.dto';
import { Post } from '../post.entity';

@ObjectType()
export class PaginatedPosts {
  @Field((type) => [Post])
  posts!: Post[];

  @Field()
  hasMore!: boolean;
}

@ObjectType()
export class UploadResponse extends Response {
  @Field({ nullable: true })
  path?: string;
}
