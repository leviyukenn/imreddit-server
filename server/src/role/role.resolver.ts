import { Resolver } from '@nestjs/graphql';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Resolver(Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}
}
