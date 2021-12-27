import { Args, Query, Resolver } from '@nestjs/graphql';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Resolver(Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query((returns) => [Role], { name: 'userRoles', nullable: 'items' })
  async getUserRoles(@Args('userId') userId: string): Promise<Role[]> {
    const userRoles = await this.roleService.findByUserId(userId);

    return userRoles;
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

  // @Mutation((returns) => RoleResponse)
  // @UseGuards(isAuth)
  // async joinCommunity(
  //   @Args('communityId') communityId: string,
  //   @Args('userId') userId: string,
  //   @Context() { req }: { req: Request },
  // ): Promise<IResponse<RoleResponse>> {
  //   if (userId !== req.session.userId) {
  //     return createErrorResponse({
  //       field: 'userId',
  //       errorCode: ResponseErrorCode.ERR0017,
  //     });
  //   }
  // }
}
