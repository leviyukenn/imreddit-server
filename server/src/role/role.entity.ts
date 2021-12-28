import { Field, ObjectType } from '@nestjs/graphql';
import { Community } from 'src/communities/community.entity';
import { User } from 'src/users/user.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

export enum CommunityRole {
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

@ObjectType()
@Entity()
export class Role extends BaseEntity {
  @Field((type) => String)
  @PrimaryColumn()
  userId!: string;

  @Field((type) => String)
  @PrimaryColumn()
  communityId!: string;

  @ManyToOne(() => Community, (comunity) => comunity.membersRole)
  community!: Community;

  @ManyToOne(() => User, (user) => user.communitiesRole)
  user!: User;

  @Field((type) => String)
  @Column({ default: () => 'NOW()' })
  joinedAt!: Date;

  @Column()
  @Field((type) => Boolean, { defaultValue: false })
  isMember!: boolean;

  @Column()
  @Field((type) => Boolean, { defaultValue: false })
  isModerator!: boolean;
}
