import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Upvote } from 'src/upvotes/upvote.entity';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
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
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field((type) => Int)
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId!: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator!: User;

  @OneToMany(() => Upvote,(upvote) => upvote.post )
  upvotes!: Upvote[];

  // @OneToMany(() => Post, (post) => post.creator)
  // posts!: Post[];
}
