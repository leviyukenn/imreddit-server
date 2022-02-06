import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class isAuth implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { req } = GqlExecutionContext.create(context).getContext<{
      req: Request;
    }>();

    if (!req.session.userId) {
      throw new HttpException('Please login first.', 401);
    }
    return true;
  }
}
