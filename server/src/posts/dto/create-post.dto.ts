import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ImageInput {
  @Field()
  path!: string;

  @Field({ nullable: true })
  caption?: string;

  @Field({ nullable: true })
  link?: string;
}

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
