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
export class CreateTextPostInput {
  @Field()
  title!: string;

  @Field()
  text!: string;

  @Field()
  communityId!: string;
}

@InputType()
export class CreateImagePostInput {
  @Field()
  title!: string;

  @Field(() => [ImageInput])
  images!: ImageInput[];

  @Field()
  communityId!: string;
}
