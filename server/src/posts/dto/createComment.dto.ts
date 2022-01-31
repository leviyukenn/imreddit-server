import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field()
  text!: string;

  @Field()
  parentId!: string;

  @Field()
  ancestorId!: string;

  @Field()
  communityId!: string;
}
