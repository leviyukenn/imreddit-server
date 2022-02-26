import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { ResponseErrorCode } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { IResponse } from 'src/response/response.dto';
import { createErrorResponse } from 'src/util/createErrors';
import { RoleResponse } from './role.dto';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Resolver(Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query((returns) => [Role], { name: 'userRoles' })
  async getUserRoles(@Args('userId') userId: string): Promise<Role[]> {
    const userRoles = await this.roleService.findByUserId(userId);

    return userRoles.filter(
      (userRole) => userRole.isMember || userRole.isModerator,
    );
  }

  @Query((returns) => Role, { name: 'userRole', nullable: true })
  async getUserRole(
    @Args('userId') userId: string,
    @Args('communityId') communityId: string,
  ): Promise<Role | undefined> {
    const userRole = await this.roleService.findByUserIdAndCommunityId(
      userId,
      communityId,
    );

    return userRole;
  }

  @Mutation((returns) => RoleResponse)
  @UseGuards(isAuth)
  async joinCommunity(
    @Args('communityId') communityId: string,
    @Args('userId') userId: string,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Role>> {
    if (userId !== req.session.userId) {
      return createErrorResponse({
        field: 'userId',
        errorCode: ResponseErrorCode.ERR0017,
      });
    }

    const role = await this.roleService.joinCommunity(userId, communityId);
    // if (!role) {
    //   return createErrorResponse({
    //     field: 'isMember',
    //     errorCode: ResponseErrorCode.ERR0017,
    //   });
    // }

    return { data: role };
  }

  @Mutation((returns) => RoleResponse)
  @UseGuards(isAuth)
  async leaveCommunity(
    @Args('communityId') communityId: string,
    @Args('userId') userId: string,
    @Context() { req }: { req: Request },
  ): Promise<IResponse<Role>> {
    if (userId !== req.session.userId) {
      return createErrorResponse({
        field: 'userId',
        errorCode: ResponseErrorCode.ERR0017,
      });
    }

    const role = await this.roleService.leaveCommunity(userId, communityId);

    return { data: role };
  }
}
