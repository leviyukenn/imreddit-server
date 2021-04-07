import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from '../user.entity';
import { Response } from '../../response/response.dto';

@InputType()
export class UserInput {
  @Field()
  username!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class UserResponse extends Response {
  @Field(() => User, { nullable: true })
  user?: User;
}
