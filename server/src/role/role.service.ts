import { Injectable } from '@nestjs/common';
import { Community } from 'src/communities/community.entity';
import { Connection } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RoleService {
  constructor(private connection: Connection) {}

  async findByUserId(userId: string) {
    return Role.find({ userId });
  }

  async findByUserIdAndCommunityId(userId: string, communityId: string) {
    return Role.findOne({ userId, communityId });
  }

  async joinCommunity(
    userId: string,
    communityId: string,
  ): Promise<Role | undefined> {
    const newRole = await Role.create({
      userId,
      communityId,
      isMember: true,
      isModerator: false,
    });
    await this.connection
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values(newRole)
      .onConflict(
        `("userId", "communityId") DO UPDATE SET "isMember" = :isMember, "joinedAt" = :joinedAt`,
      )
      .setParameter('isMember', true)
      .setParameter('joinedAt', new Date())
      .execute();

    return this.findByUserIdAndCommunityId(userId, communityId);
  }

  async leaveCommunity(
    userId: string,
    communityId: string,
  ): Promise<Role | undefined> {
    await this.connection
      .createQueryBuilder()
      .update(Role)
      .set({ isMember: false })
      .where('userId = :userId AND communityId = :communityId', {
        userId,
        communityId,
      })
      .execute();

    return this.findByUserIdAndCommunityId(userId, communityId);
  }

}
