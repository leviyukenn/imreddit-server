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
}
