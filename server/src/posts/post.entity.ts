import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Upvote } from 'src/upvotes/upvote.entity';
import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  UpdateDateColumn,
} from 'typeorm';

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

  @Field(() => User)
  @ManyToOne((type) => User, (user) => user.posts, { eager: true })
  @JoinTable()
  creator!: User;

  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes!: Upvote[];

  @ManyToOne(() => Post, (post) => post.children)
  // @Field(() => Post, { nullable: true })
  parent!: Post;

  @Field(() => [Post], { nullable: 'items' })
  @OneToMany(() => Post, (post) => post.parent)
  children!: Post[];

  // @TreeParent()
  // @Field(() => Post, { nullable: true })
  // parent?: Post;

  // @TreeChildren()
  // @Field(() => [Post], { nullable: 'items' })
  // children!: Post[];
}
