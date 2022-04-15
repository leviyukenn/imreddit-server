import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { CommunityService } from 'src/communities/community.service';
import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { isAuth } from 'src/guards/isAuth';
import { UsersService } from 'src/users/users.service';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Resolver(Role)
export class RoleResolver {
  constructor(
    private readonly roleService: RoleService,
    private readonly communityService: CommunityService,
    private readonly userService: UsersService,
  ) {}

  @Query((returns) => [Role], { name: 'userRoles' })
  async getUserRoles(@Args('userId') userId: string): Promise<Role[]> {
    const userRoles = await this.roleService.findByUserId(userId);

    return userRoles.filter(
      (userRole) => userRole.isMember || userRole.isModerator,
    );
  }

  @Query((returns) => Role, { name: 'userRole', nullable: true })
  async getUserRole(
    @Args('userName') userName: string,
    @Args('communityName') communityName: string,
  ): Promise<Role | undefined> {
    const user = await this.userService.findByUserName(userName);
    if (!user) return undefined;
    const community = await this.communityService.findByName(communityName);
    if (!community) return undefined;

    const userRole = await this.roleService.findByUserIdAndCommunityId(
      user.id,
      community.id,
    );

    return userRole;
  }

  @Mutation((returns) => Role)
  @UseGuards(isAuth)
  async joinCommunity(
    @Args('communityName') communityName: string,
    @Context() { req }: { req: Request },
  ): Promise<Role> {
    const community = await this.communityService.findByName(communityName);
    if (!community)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0014)!,
        HttpStatus.NOT_FOUND,
      );

    const role = await this.roleService.joinCommunity(
      req.session.userId!,
      community.id,
    );
    if (!role) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0018)!,
        HttpStatus.NOT_MODIFIED,
      );
    }

    return role;
  }

  @Mutation((returns) => Role)
  @UseGuards(isAuth)
  async leaveCommunity(
    @Args('communityName') communityName: string,
    @Context() { req }: { req: Request },
  ): Promise<Role> {
    const community = await this.communityService.findByName(communityName);
    if (!community)
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0014)!,
        HttpStatus.NOT_FOUND,
      );

    const role = await this.roleService.leaveCommunity(
      req.session.userId!,
      community.id,
    );
    if (!role) {
      throw new HttpException(
        responseErrorMessages.get(ResponseErrorCode.ERR0038)!,
        HttpStatus.NOT_MODIFIED,
      );
    }

    return role;
  }
}
