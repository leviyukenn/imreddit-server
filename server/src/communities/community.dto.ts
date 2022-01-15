import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { createTypedResponse } from 'src/response/response.dto';
import { Community } from './community.entity';

@InputType()
export class CreateCommunityInput {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => [String])
  topicIds!: string[];
}

@InputType()
export class CommunityAppearanceInput {
  @Field()
  background!: string;

  @Field()
  banner!: string;

  @Field()
  icon!: string;

  @Field()
  backgroundColor!: string;

  @Field()
  bannerColor!: string;
}

@ObjectType()
export class CommunityResponse extends createTypedResponse(
  Community,
  'community',
) {}
