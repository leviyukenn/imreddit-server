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
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  UserResponse,
} from './dto/user.dto';
import * as argon2 from 'argon2';
import { Request, Response } from 'express';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from 'src/constant/constant';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from './util/validators';
import { sendEmail } from './util/sendEamil';
import { FieldError } from 'src/response/response.dto';
import { RedisCacheService } from 'src/redisCache/redisCache.service';
import { v4 } from 'uuid';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisCache: RedisCacheService,
  ) {}

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

  @Mutation((returns) => UserResponse)
  async changePassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
    @Context() { req }: { req: Request },
  ) {
    //validate the password field
    const errors = [...validatePassword(newPassword)];
    if (errors.length !== 0) return { errors };

    //validate token and get the corresponding data from cache
    const userId = await this.redisCache
      .get(FORGOT_PASSWORD_PREFIX + token)
      .catch();

    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'The token has been expired.',
          },
        ],
      };
    }

    const user = await this.usersService.findByUserId(parseInt(userId));

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User no longer exits.',
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);
    await this.usersService.save(user);
    await this.redisCache.del(FORGOT_PASSWORD_PREFIX + token);
    req.session.userId = user.id;
    return { user };
  }

  @Mutation((returns) => Boolean)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ) {
    //validate input fields
    const errors = [
      ...validateUsername(forgotPasswordInput.username),
      ...validateEmail(forgotPasswordInput.email),
    ];
    if (errors.length !== 0) return false;

    //check whether the matching username and email exist
    const user = await this.usersService.findByUsernameAndEmail(
      forgotPasswordInput.username,
      forgotPasswordInput.email,
    );
    if (!user) {
      return false;
    }

    const token = v4();

    this.redisCache.set(FORGOT_PASSWORD_PREFIX + token, user.id.toString(), {
      ttl: 1000 * 60 * 60 * 24,
    });

    const mailOptions: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    } = {
      from: 'ben@ben.com',
      to: user.email,
      subject: 'Please change your password',
      text: 'change your password',
      html: `<a href="http://localhost:3005/change-password/${token}">change your password</a>`,
    };

    return sendEmail(mailOptions)
      .then(() => true)
      .catch(() => false);
  }

  @Mutation((returns) => UserResponse)
  async register(
    @Args('userInput') registerInput: RegisterInput,
    @Context() { req }: { req: Request },
  ) {
    const errors = [
      ...validateUsername(registerInput.username),
      ...validatePassword(registerInput.password),
      ...validateEmail(registerInput.email),
    ];
    if (errors.length !== 0) return { errors };

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
    const errors = [
      ...validateUsername(userInput.username),
      ...validatePassword(userInput.password),
    ];
    if (errors.length !== 0) return { errors };

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
