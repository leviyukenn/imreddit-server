import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCommunityInput {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  parentId?: string;

  @Field(() => [String])
  topicIds!: string[];
}
