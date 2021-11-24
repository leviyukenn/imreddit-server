import { Injectable } from '@nestjs/common';
import { CommunityRole, Role } from 'src/role/role.entity';
import { Connection, getManager } from 'typeorm';
import { CreateCommunityInput } from './community.dto';
import { Community } from './community.entity';

@Injectable()
export class CommunityService {
  constructor(
    private connection: Connection, // @InjectRepository(Community) // private communityRepository: Repository<Community>,
  ) {}

  async createCommunity(
    createCommunityInput: CreateCommunityInput,
    userId: string,
  ): Promise<Community | undefined> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (createCommunityInput.topicIds.length === 0) {
        throw new Error('Topics are required.');
      }
      const newCommunity = await Community.create({
        ...createCommunityInput,
        topics: createCommunityInput.topicIds.map((topicId) => {
          return {
            id: topicId,
          };
        }),
      });

      const savedCommunity = await queryRunner.manager.save(newCommunity);

      const newRole = await Role.create({
        userId,
        communityId: savedCommunity.id,
        role: CommunityRole.MODERATOR,
      });

      await queryRunner.manager.save(newRole);

      await queryRunner.commitTransaction();
      const community = Community.findOne(newCommunity.id, {
        relations: ['topics'],
      });
      return community;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }

  async findByName(name: string) {
    return Community.findOne({ name });
  }

  async findByUserId(userId: string) {
    const communites = await getManager()
      .createQueryBuilder(Community, 'community')
      .innerJoinAndSelect('community.membersRole', 'role')
      .where('role.userId = :userId', { userId: userId })
      .getMany();
    return communites;
  }
}
