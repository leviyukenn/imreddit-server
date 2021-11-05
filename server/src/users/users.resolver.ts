import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import * as argon2 from 'argon2';
import { Request } from 'express';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from 'src/constant/constant';
import { ResponseErrorCode } from 'src/constant/errors';
import { RedisCacheService } from 'src/redisCache/redisCache.service';
import { IResponse } from 'src/response/response.dto';
import { createErrorResponse } from 'src/util/createErrors';
import { InputParameterValidator } from 'src/util/validators';
import { v4 } from 'uuid';
import { sendEmail } from '../util/sendEamil';
import {
  CompleteResponse,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  UserResponse,
} from './dto/user.dto';
import { User, UserRole } from './user.entity';
import { UsersService } from './users.service';

@Resolver(User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisCache: RedisCacheService,
  ) {}

  @ResolveField()
  email(@Root() user: User, @Context() { req }: { req: Request }) {
    //current user can only request his own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    return '';
  }

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

  @Mutation(() => CompleteResponse)
  async changePassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Boolean>> {
    //validate the password field
    const validator = InputParameterValidator.object().validatePassword(
      newPassword,
    );
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    //validate token and get the corresponding data from cache
    const userId = await this.redisCache
      .get(FORGOT_PASSWORD_PREFIX + token)
      .catch();

    if (!userId) {
      return createErrorResponse({
        field: 'validation token',
        errorCode: ResponseErrorCode.ERR0008,
      });
    }

    const user = await this.usersService.findByUserId(userId);

    if (!user) {
      return createErrorResponse({
        field: 'userId',
        errorCode: ResponseErrorCode.ERR0009,
      });
    }

    const hashedPassword = await argon2.hash(newPassword);
    await this.usersService.updateUserPassword(user.id, hashedPassword);
    await this.redisCache.del(FORGOT_PASSWORD_PREFIX + token);
    req.session.userId = user.id;
    return { data: true };
  }

  @Mutation((returns) => CompleteResponse)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ): Promise<IResponse<Boolean>> {
    const validator = InputParameterValidator.object()
      .validateUsername(forgotPasswordInput.username)
      .validateEmail(forgotPasswordInput.email);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    //check whether the matching username and email exist
    const user = await this.usersService.findByUsernameAndEmail(
      forgotPasswordInput.username,
      forgotPasswordInput.email,
    );
    if (!user) {
      return { data: true };
    }

    const token = v4();

    this.redisCache.set(FORGOT_PASSWORD_PREFIX + token, user.id, {
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
    await sendEmail(mailOptions).catch();
    return { data: true };
  }

  @Mutation((returns) => UserResponse)
  async register(
    @Args('userInput') registerInput: RegisterInput,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<User>> {
    //check input parameters
    const validator = InputParameterValidator.object()
      .validateUsername(registerInput.username)
      .validatePassword(registerInput.password)
      .validateEmail(registerInput.email);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    let user = await this.usersService.findByUserName(registerInput.username);
    //check whether the username exists
    if (user) {
      return createErrorResponse({
        field: 'input parameter: username',
        errorCode: ResponseErrorCode.ERR0010,
      });
    }

    user = await this.usersService.findByEmail(registerInput.email);
    //check whether the email is taken
    if (user) {
      return createErrorResponse({
        field: 'input parameter: email',
        errorCode: ResponseErrorCode.ERR0011,
      });
    }

    //hash the password
    const hashedPassword = await argon2.hash(registerInput.password);
    const returnedUser = await this.usersService.createUser({
      ...registerInput,
      password: hashedPassword,
      role: UserRole.NORMAL_USER,
    });
    req.session.userId = returnedUser.id;
    return { data: returnedUser };
  }

  @Mutation((returns) => UserResponse)
  async login(
    @Args('userInput') userInput: LoginInput,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<User>> {
    const validator = InputParameterValidator.object()
      .validateUsername(userInput.username)
      .validatePassword(userInput.password);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    const user = await this.usersService.findByUserName(userInput.username);

    //check whether the username exists
    if (!user) {
      return createErrorResponse({
        field: 'input parameter: username',
        errorCode: ResponseErrorCode.ERR0012,
      });
    }

    //validate the password
    const isValid = await argon2.verify(user!.password, userInput.password);

    if (!isValid) {
      return createErrorResponse({
        field: 'input parameter: password',
        errorCode: ResponseErrorCode.ERR0013,
      });
    }

    req.session.userId = user.id;

    return { data: user };
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
