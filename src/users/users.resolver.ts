import { HttpException, UseGuards } from '@nestjs/common';
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
import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { MailService } from 'src/mail/mail.service';
import { RedisCacheService } from 'src/redisCache/redisCache.service';
import { IResponse } from 'src/response/response.dto';
import { createErrorResponse } from 'src/util/createErrors';
import { createRandomAvatar } from 'src/util/createRandomAvatarLink';
import { InputParameterValidator } from 'src/util/validators';
import { vertificationPassword } from 'src/util/vertification';
import { v4 } from 'uuid';
import {
  CompleteResponse,
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
    private readonly mailService: MailService,
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
  async user(@Args('userName') userName: string) {
    const user = await this.usersService.findByUserName(userName);
    return user;
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

  @Mutation(() => UserResponse)
  async changePassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<User>> {
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
        field: 'password',
        errorCode: ResponseErrorCode.ERR0008,
      });
    }

    const user = await this.usersService.findByUserId(userId);

    if (!user) {
      return createErrorResponse({
        field: 'password',
        errorCode: ResponseErrorCode.ERR0009,
      });
    }

    const hashedPassword = await argon2.hash(newPassword);
    await this.usersService.updateUserPassword(user.id, hashedPassword);
    await this.redisCache.del(FORGOT_PASSWORD_PREFIX + token);
    req.session.userId = user.id;
    return { data: user };
  }

  @Mutation((returns) => CompleteResponse)
  async forgotPassword(
    @Args('email') email: string,
  ): Promise<IResponse<Boolean>> {
    const validator = InputParameterValidator.object().validateEmail(email);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    //check whether the email exist
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { data: true };
    }

    const token = v4();

    this.redisCache.set(FORGOT_PASSWORD_PREFIX + token, user.id, {
      ttl: 1000 * 60 * 60 * 24,
    });

    this.mailService.sendUserConfirmation(user, token).catch();
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
        field: 'username',
        errorCode: ResponseErrorCode.ERR0010,
      });
    }

    user = await this.usersService.findByEmail(registerInput.email);
    //check whether the email is taken
    if (user) {
      return createErrorResponse({
        field: 'email',
        errorCode: ResponseErrorCode.ERR0011,
      });
    }

    //hash the password
    const hashedPassword = await argon2.hash(registerInput.password);
    const avatar = await createRandomAvatar(registerInput.username);
    const returnedUser = await this.usersService.createUser({
      ...registerInput,
      password: hashedPassword,
      role: UserRole.NORMAL_USER,
      avatar: avatar,
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
        field: 'username',
        errorCode: ResponseErrorCode.ERR0012,
      });
    }

    if (user.isGoogleAuthentication) {
      return createErrorResponse({
        field: 'username',
        errorCode: ResponseErrorCode.ERR0015,
      });
    }

    //validate the password
    const isValid = await vertificationPassword(
      user.password!,
      userInput.password,
    );

    if (!isValid) {
      return createErrorResponse({
        field: 'password',
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

  @Mutation((returns) => UserResponse)
  async googleAuthentication(
    @Args('idToken') idToken: string,
    @Context() { req }: { req: Request },
  ): Promise<UserResponse> {
    try {
      const user = await this.usersService.googleAuthenticate(idToken);
      req.session.userId = user?.id || '';
      return { data: user };
    } catch (err) {
      return createErrorResponse({
        field: 'google authentication id token',
        errorCode: ResponseErrorCode.ERR0016,
      });
    }
  }

  @Mutation((returns) => User)
  @UseGuards(isAuth)
  async changeUserAvatar(
    @Args('avatarSeed') avatarSeed: string,
    @Context() { req }: { req: Request },
  ): Promise<User> {
    const avatar = await createRandomAvatar(avatarSeed);

    const affected = await this.usersService.updateUserAvatar(
      req.session.userId!,
      avatar,
    );
    if (!affected)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0028)!,
        201,
      );

    const user = await this.usersService.findByUserId(req.session.userId!);
    return user!;
  }

  // @Mutation((returns) => Boolean)
  // async generateAvatarForAllUser(): Promise<boolean> {
  //   const users = await this.usersService.findAllUser();

  //   users.forEach(async (user) => {
  //     const avatar = await createRandomAvatar(user.username);
  //     await this.usersService.updateUserAvatar(user.id, avatar);
  //   });

  //   return true;
  // }
  @Mutation((returns) => UserResponse)
  @UseGuards(isAuth)
  async editUserAbout(
    @Args('about') about: string,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<User>> {
    const validator = InputParameterValidator.object().validateUserAbout(about);
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    const updatedRows = await this.usersService.editUserAbout(
      req.session.userId!,
      about,
    );
    if (!updatedRows) {
      return createErrorResponse({
        field: 'about',
        errorCode: ResponseErrorCode.ERR0032,
      });
    }

    const user = await this.usersService.findByUserId(req.session.userId!);
    if (!user) {
      return createErrorResponse({
        field: 'user',
        errorCode: ResponseErrorCode.ERR0029,
      });
    }

    return { data: user };
  }

  @Mutation((returns) => UserResponse)
  @UseGuards(isAuth)
  async editUserName(
    @Args('username') username: string,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<User>> {
    const validator = InputParameterValidator.object().validateUsername(
      username,
    );
    if (!validator.isValid()) {
      return validator.getErrorResponse();
    }

    const existingUser = await this.usersService.findByUserName(username);
    //check whether the username exists
    if (existingUser) {
      return createErrorResponse({
        field: 'username',
        errorCode: ResponseErrorCode.ERR0010,
      });
    }

    const updatedRows = await this.usersService.editUserName(
      req.session.userId!,
      username,
    );
    if (!updatedRows) {
      return createErrorResponse({
        field: 'username',
        errorCode: ResponseErrorCode.ERR0032,
      });
    }

    const user = await this.usersService.findByUserId(req.session.userId!);
    if (!user) {
      return createErrorResponse({
        field: 'user',
        errorCode: ResponseErrorCode.ERR0029,
      });
    }

    return { data: user };
  }
}
