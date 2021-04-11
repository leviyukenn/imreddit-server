import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
  Mutation,
  Context,
} from '@nestjs/graphql';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UserInput, UserResponse } from './dto/user.dto';
import * as argon2 from 'argon2';
import { Request } from 'express';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => UserResponse)
  async loginStatus(@Context() { req }: { req: Request }) {
    if (!req.session.userId) {
      return {
        errors: [
          {
            field: 'userId',
            message: 'Not logged in.',
          },
        ],
      };
    }
    const user = await this.usersService.findByUserId(req.session.userId);
    if (!user) {
      return {
        errors: [
          {
            field: 'userId',
            message: "Can't find the user info.",
          },
        ],
      };
    }
    return { user };
  }

  @Mutation((returns) => UserResponse)
  async register(
    @Args('userInput') userInput: UserInput,
    @Context() { req }: { req: Request },
  ) {
    const user = await this.usersService.findByUserName(userInput.username);

    //check whether the username exists
    if (user) {
      const res: UserResponse = {
        errors: [
          {
            field: 'username',
            message: 'That username is already taken',
          },
        ],
      };
      return res;
    }

    const newUser = new User();
    //hash the password
    const hashedPassword = await argon2.hash(userInput.password);
    newUser.username = userInput.username;
    newUser.password = hashedPassword;
    const returnedUser = await this.usersService.save(newUser);
    req.session.userId = returnedUser.id;
    return { user: returnedUser };
  }

  @Mutation((returns) => UserResponse)
  async login(
    @Args('userInput') userInput: UserInput,
    @Context() { req }: { req: Request },
  ) {
    const user = await this.usersService.findByUserName(userInput.username);

    //check whether the username exists
    if (!user) {
      const res: UserResponse = {
        errors: [
          {
            field: 'username',
            message: "that username doesn't exists",
          },
        ],
      };
      return res;
    }

    //validate the password
    const isValid = await argon2.verify(user!.password, userInput.password);

    if (!isValid) {
      const res: UserResponse = {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
      return res;
    }

    req.session.userId = user.id;

    return { user };
  }
}
