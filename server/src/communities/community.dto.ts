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

@ObjectType()
export class CommunityResponse extends createTypedResponse(Community) {}
