import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { UserRole } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class isAdmin implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const { req } = GqlExecutionContext.create(context).getContext<{
      req: Request;
    }>();

    if (!req.session.userId) {
      return false;
    }

    const user = await this.usersService.findByUserId(req.session.userId);
    if (user?.role !== UserRole.ADMINISTRATOR) {
      return false;
    }

    return true;
  }
}
