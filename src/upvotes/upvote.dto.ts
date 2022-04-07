import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Upvote } from './upvote.entity';

@InputType()
export class VoteInput {
  @Field()
  postId!: string;

  @Field(() => Int)
  value!: number;
}

@ObjectType()
export class UpvoteResponse {
  @Field((type) => Upvote)
  upvote!: Upvote;

  @Field((type) => Int)
  points!: number;
}
