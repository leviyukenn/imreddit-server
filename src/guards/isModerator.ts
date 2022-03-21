import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class isModerator implements CanActivate {
  constructor(private readonly roleService: RoleService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(context).getContext<{
      req: Request;
    }>();
    if (!req.session.userId) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0030)!,
        HttpStatus.FORBIDDEN,
      );
    }
    const args = GqlExecutionContext.create(context).getArgs();
    if (!(args?.communityId && typeof args.communityId === 'string')) {
      return false;
    }
    const communityId = args.communityId as string;

    const role = await this.roleService.findByUserIdAndCommunityId(
      req.session.userId,
      communityId,
    );

    if (role?.isModerator) {
      return true;
    }

    throw new HttpException(
      responseErrorMessages.get(ResponseErrorCode.ERR0033)!,
      HttpStatus.FORBIDDEN,
    );
  }
}
