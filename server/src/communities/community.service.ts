import { Injectable } from '@nestjs/common';
import { Role } from 'src/role/role.entity';
import { Connection, getManager, getRepository } from 'typeorm';
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
        isMember: true,
        isModerator: true,
      });

      await queryRunner.manager.save(newRole);

      await queryRunner.commitTransaction();
      const community = Community.findOne(newCommunity.id, {
        relations: ['topics'],
      });
      return community;
    } catch (err) {
      console.log(err)
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }

  async findByName(name: string) {
    return Community.findOne({ name }, { relations: ['topics'] });
  }

  async findById(communityId: string) {
    return Community.findOne({ id: communityId }, { relations: ['topics'] });
  }

  async findAll() {
    return Community.find({ relations: ['topics'] });
  }

  async countMemberships(communityId: string) {
    const { count } = await getRepository(Community)
      .createQueryBuilder('community')
      .innerJoin('community.membersRole', 'role')
      .select('count(role.userId)', 'count')
      .where('community.id = :id AND role.isMember = :isMember', {
        id: communityId,
        isMember: true,
      })
      .getRawOne();
    return count;
  }

  async findByUserId(userId: string) {
    const communities = await getManager()
      .createQueryBuilder(Community, 'community')
      .innerJoin('community.membersRole', 'role')
      .where('role.userId = :userId', { userId: userId })
      .getMany();
    return communities;
  }

  async editCommunityDescription(communityId: string, description: string) {
    const result = await this.connection
      .createQueryBuilder()
      .update(Community)
      .set({ description })
      .where('id = :communityId', {
        communityId,
      })
      .execute();

    return result.affected;
  }

  async updateCommunityAppearance(
    communityId: string,
    appearance: {
      background: string;
      icon: string;
      banner: string;
      backgroundColor: string;
      bannerColor: string;
    },
  ) {
    const result = await this.connection
      .createQueryBuilder()
      .update(Community)
      .set({ ...appearance })
      .where('id = :communityId', {
        communityId,
      })
      .execute();

    return result.affected;
  }
}
