import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { createTypedResponse } from 'src/response/response.dto';
import { User } from '../user.entity';

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

@InputType()
export class ForgotPasswordInput {
  @Field()
  username!: string;

  @Field()
  email!: string;
}

@ObjectType()
export class CompleteResponse extends createTypedResponse(
  Boolean,
  'isComplete',
) {}

@ObjectType()
export class UserResponse extends createTypedResponse(User, 'user') {}
