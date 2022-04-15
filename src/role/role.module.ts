import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Role } from './role.entity';
import { RoleResolver } from './role.resolver';
import { RoleService } from './role.service';
import { CommunityModule } from 'src/communities/community.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), UsersModule,forwardRef(() => CommunityModule)],
  providers: [RoleResolver, RoleService],
  exports: [RoleService],
})
export class RoleModule {}
