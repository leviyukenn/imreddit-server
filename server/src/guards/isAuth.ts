import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class isAuth implements CanActivate {
  constructor(private readonly userService: UsersService) {}
  canActivate(context: ExecutionContext): boolean {
    const { req } = GqlExecutionContext.create(context).getContext<{
      req: Request;
    }>();

    if (!req.session.userId) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0030)!,
        401,
      );
    }

    const user = this.userService.findByUserId(req.session.userId);

    if (!user)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0029)!,
        401,
      );
    return true;
  }
}
