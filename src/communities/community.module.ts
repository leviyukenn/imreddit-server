import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from 'src/role/role.module';
import { UsersModule } from 'src/users/users.module';
import { Community } from './community.entity';
import { CommunityResolver } from './community.resolver';
import { CommunityService } from './community.service';

@Module({
  imports: [TypeOrmModule.forFeature([Community]), RoleModule, UsersModule],
  providers: [CommunityResolver, CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
