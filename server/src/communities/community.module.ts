import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './community.entity';
import { CommunityResolver } from './community.resolver';
import { CommunityService } from './community.service';

@Module({
  imports: [TypeOrmModule.forFeature([Community])],
  providers: [CommunityResolver, CommunityService],
})
export class CommunityModule {}
