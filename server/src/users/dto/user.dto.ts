import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from '../user.entity';
import { Response } from '../../response/response.dto';

@InputType()
export class LoginInput {
  @Field()
  username!: string;

  @Field()
  password!: string;
}

@InputType()
export class RegisterInput {
  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class UserResponse extends Response {
  @Field(() => User, { nullable: true })
  user?: User;
}
