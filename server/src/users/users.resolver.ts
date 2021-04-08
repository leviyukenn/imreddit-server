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
import { CACHE_MANAGER, Inject, Req } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request } from 'express';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation((returns) => UserResponse)
  async register(@Args('userInput') userInput: UserInput) {
    const user = await this.usersService.findByUserName(userInput.username);

    //check whether the username exists
    if (user) {
      const res: UserResponse = {
        errors: [
          {
            field: 'username',
            message: 'that username exists',
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
