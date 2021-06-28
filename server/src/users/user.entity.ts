import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/posts/post.entity';
import { Role } from 'src/role/role.entity';
import { Topic } from 'src/topic/topic.entity';
import { Upvote } from 'src/upvotes/upvote.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMINISTRATOR = 'administrator',
  NORMAL_USER = 'normalUser',
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field((type) => String)
  id!: string;

  @Field((type) => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field((type) => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field((type) => String)
  @Column()
  role!: UserRole;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts!: Post[];

  @OneToMany(() => Topic, (topic) => topic.creator)
  topics!: Topic[];

  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes!: Upvote[];

  @OneToMany(() => Role, (role) => role.user)
  communitiesRole!: Role[];
}
