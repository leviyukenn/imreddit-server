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
import { LoginInput, RegisterInput, UserResponse } from './dto/user.dto';
import * as argon2 from 'argon2';
import { Request, Response } from 'express';
import { COOKIE_NAME } from 'src/constant/constant';
import { validateRegister } from './util/validateRegister';
import { sendEmail } from './util/sendEamil';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => User, { nullable: true })
  async me(@Context() { req }: { req: Request }) {
    if (!req.session.userId) {
      return null;
    }
    const user = await this.usersService.findByUserId(req.session.userId);
    if (!user) {
      return null;
    }
    return user;
  }

  @Mutation((returns) => Boolean)
  async forgotPassword() {
    let isSuccess = true;
    await sendEmail().catch(() => (isSuccess = false));
    return isSuccess;
  }

  @Mutation((returns) => UserResponse)
  async register(
    @Args('userInput') registerInput: RegisterInput,
    @Context() { req }: { req: Request },
  ) {
    const errors = validateRegister(registerInput);
    if (errors) return { errors };

    let user = await this.usersService.findByUserName(registerInput.username);
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

    user = await this.usersService.findByEmail(registerInput.email);
    //check whether the email is taken
    if (user) {
      const res: UserResponse = {
        errors: [
          {
            field: 'email',
            message: 'That email is already registered',
          },
        ],
      };
      return res;
    }

    const newUser = new User();
    //hash the password
    const hashedPassword = await argon2.hash(registerInput.password);
    newUser.username = registerInput.username;
    newUser.password = hashedPassword;
    newUser.email = registerInput.email;
    const returnedUser = await this.usersService.save(newUser);
    req.session.userId = returnedUser.id;
    return { user: returnedUser };
  }

  @Mutation((returns) => UserResponse)
  async login(
    @Args('userInput') userInput: LoginInput,
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

  @Mutation((returns) => Boolean)
  logout(@Context() { req }: { req: Request }) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (req.res) {
          req.res?.clearCookie(COOKIE_NAME);
        }
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
