import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/posts/post.entity';
import { Role } from 'src/role/role.entity';
import { Topic } from 'src/topic/topic.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Community extends BaseEntity {
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
  name!: string;

  @Field()
  @Column()
  description!: string;

  @OneToMany(() => Role, (role) => role.community)
  membersRole!: Role[];

  @OneToMany(() => Post, (post) => post.community)
  posts!: Post[];

  @Field(() => [Topic])
  @ManyToMany(() => Topic)
  @JoinTable()
  topics!: Topic[];
}
