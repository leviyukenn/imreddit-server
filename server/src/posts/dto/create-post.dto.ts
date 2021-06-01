import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field({ nullable: true })
  title!: string;

  @Field()
  text!: string;

  @Field({ nullable: true })
  parentId!: string;
}
