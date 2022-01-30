import { InputType, Field } from "@nestjs/graphql";import { ImageInput } from "./create-post.dto";

@InputType()
export class CreatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  text?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => [ImageInput], { nullable: true })
  images?: ImageInput[];

  @Field()
  communityId!: string;
}