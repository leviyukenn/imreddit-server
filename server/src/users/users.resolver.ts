import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UserInput, UserResponse } from './dto/user.dto';
import * as argon2 from 'argon2';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation((returns) => UserResponse)
  async register(@Args('userInput') userInput: UserInput) {
    const user = await this.usersService.findByUserName(userInput.username);

    //检查用户名是否存在
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
}
