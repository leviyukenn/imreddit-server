import { Field, ObjectType } from '@nestjs/graphql';
import { Community } from 'src/communities/community.entity';
import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CommunityRole {
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

@ObjectType()
@Entity()
export class Role extends BaseEntity {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  communityId!: string;

  @ManyToOne(() => Community, (comunity) => comunity.membersRole)
  community!: Community;

  @ManyToOne(() => User, (user) => user.communitiesRole)
  user!: User;

  @Field((type) => String)
  @UpdateDateColumn()
  joinedAt = new Date();

  @Column()
  @Field((type) => String)
  role!: CommunityRole;
}
