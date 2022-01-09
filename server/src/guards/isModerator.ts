import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class isModerator implements CanActivate {
  constructor(private readonly roleService: RoleService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(context).getContext<{
      req: Request;
    }>();
    if (!req.session.userId) {
      return false;
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

    return false;
  }
}
