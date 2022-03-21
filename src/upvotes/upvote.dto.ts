import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class VoteInput {
  @Field()
  postId!: string;

  @Field(() => Int)
  value!: number;
}
