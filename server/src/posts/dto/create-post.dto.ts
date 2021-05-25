import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field()
  title!: string;

  @Field()
  text!: string;

  @Field({ nullable: true })
  parentId!: string;
}
